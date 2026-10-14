"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { navItems } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">CRM Jurídico</p>
          <p className="text-xs text-muted-foreground">Núcleo jurídico</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-2 rounded-lg bg-muted/50 px-3 py-2">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
