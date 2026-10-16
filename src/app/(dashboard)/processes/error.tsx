"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProcessesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado na rota /processes:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-lg border-destructive/30 bg-destructive/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Erro ao carregar processos</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Ocorreu uma falha ao buscar os processos judiciais vinculados. O sistema tentará reconectar assim que você clicar abaixo.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
