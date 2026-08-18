import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">
        O recurso que você procura não existe ou foi removido.
      </p>
      <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Voltar ao dashboard
      </Link>
    </div>
  );
}
