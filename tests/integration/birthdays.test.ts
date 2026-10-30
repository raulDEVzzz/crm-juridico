import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import {
  calculateDaysUntilBirthday,
  filterUpcomingBirthdays,
  getBirthdayMonthDayWindow,
  isBirthdayToday,
} from "../../src/lib/birthdays";
import { getClientsWithBirthdayWindowForUser } from "../../src/lib/services/clients";
import {
  createClient,
  createUser,
  resetTestData,
  testDb,
} from "./helpers/db";

beforeEach(async () => {
  await resetTestData();
});

after(async () => {
  await testDb.$disconnect();
});

function brasiliaNoon(isoDate: string): Date {
  return new Date(`${isoDate}T15:00:00.000Z`);
}

test("janela de aniversários atravessa a virada do ano (28/12 a 03/01)", () => {
  const reference = brasiliaNoon("2026-12-28");

  assert.equal(calculateDaysUntilBirthday(new Date(Date.UTC(1990, 11, 28)), reference), 0);
  assert.equal(calculateDaysUntilBirthday(new Date(Date.UTC(1990, 11, 31)), reference), 3);
  assert.equal(calculateDaysUntilBirthday(new Date(Date.UTC(1991, 0, 3)), reference), 6);
  assert.equal(calculateDaysUntilBirthday(new Date(Date.UTC(1991, 0, 4)), reference), 7);

  const window = getBirthdayMonthDayWindow(6, reference);
  assert.deepEqual(window, {
    startMd: 1228,
    endMd: 103,
    wrapsYear: true,
    referenceYear: 2026,
  });

  const filtered = filterUpcomingBirthdays(
    [
      { name: "28/12", birthDate: new Date(Date.UTC(1990, 11, 28)) },
      { name: "31/12", birthDate: new Date(Date.UTC(1990, 11, 31)) },
      { name: "03/01", birthDate: new Date(Date.UTC(1991, 0, 3)) },
      { name: "04/01", birthDate: new Date(Date.UTC(1991, 0, 4)) },
    ],
    6,
    reference
  );

  assert.deepEqual(
    filtered.map((client) => [client.name, client.daysUntil]),
    [
      ["28/12", 0],
      ["31/12", 3],
      ["03/01", 6],
    ]
  );
});

test("29/02 é tratado como 28/02 em ano não bissexto e mantido em ano bissexto", () => {
  const birthDate = new Date(Date.UTC(2000, 1, 29));

  assert.equal(
    calculateDaysUntilBirthday(birthDate, brasiliaNoon("2027-02-27")),
    1
  );
  assert.equal(
    isBirthdayToday(birthDate, brasiliaNoon("2027-02-28")),
    true
  );
  assert.equal(
    calculateDaysUntilBirthday(birthDate, brasiliaNoon("2028-02-28")),
    1
  );
  assert.equal(
    isBirthdayToday(birthDate, brasiliaNoon("2028-02-29")),
    true
  );
});

test("filtro de aniversariantes no banco respeita a virada do ano", async () => {
  const user = await createUser();
  await createClient(user.id, {
    name: "Dezembro",
    birthDate: new Date(Date.UTC(1990, 11, 31)),
  });
  await createClient(user.id, {
    name: "Janeiro",
    birthDate: new Date(Date.UTC(1991, 0, 2)),
  });
  await createClient(user.id, {
    name: "Fora da janela",
    birthDate: new Date(Date.UTC(1991, 0, 4)),
  });
  await createClient(user.id, {
    name: "Junho",
    birthDate: new Date(Date.UTC(1990, 5, 15)),
  });

  const clients = await getClientsWithBirthdayWindowForUser(
    testDb,
    user.id,
    6,
    brasiliaNoon("2026-12-28")
  );

  assert.deepEqual(
    clients.map((client) => client.name),
    ["Dezembro", "Janeiro"]
  );
});

test("filtro de 29/02 no banco encontra o aniversariante em 28/02", async () => {
  const user = await createUser();
  await createClient(user.id, {
    name: "Bissexto",
    birthDate: new Date(Date.UTC(2000, 1, 29)),
  });
  await createClient(user.id, {
    name: "Outro",
    birthDate: new Date(Date.UTC(1990, 1, 27)),
  });

  const reference = brasiliaNoon("2027-02-28");
  const clients = await getClientsWithBirthdayWindowForUser(
    testDb,
    user.id,
    1,
    reference
  );

  assert.deepEqual(
    clients.map((client) => client.name),
    ["Bissexto"]
  );

  const filtered = filterUpcomingBirthdays(clients, 1, reference);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].daysUntil, 0);
  assert.equal(filtered[0].isToday, true);
});
