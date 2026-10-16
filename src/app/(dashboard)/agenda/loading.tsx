import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando agenda">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-5 w-64 sm:w-80" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Seção Pendentes Skeleton */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    {/* Bloco de Data */}
                    <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
                    
                    {/* Informações do Evento */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Seção Concluídos Skeleton */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-28" />
        <Card className="opacity-60">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
