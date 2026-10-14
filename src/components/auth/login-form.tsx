"use client";

import { useActionState } from "react";
import { Loader2, Scale } from "lucide-react";

import { loginAction, type LoginActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginActionState = {
  success: false,
  message: "",
};

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/dashboard" }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Scale className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-2xl">CRM Jurídico</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar clientes e processos.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="erickdocarmo"
              autoComplete="username"
              required
            />
            {state.errors?.username && (
              <p className="text-sm text-destructive">{state.errors.username[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {state.errors?.password && (
              <p className="text-sm text-destructive">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {state.message && !state.success && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>

      </CardContent>
    </Card>
  );
}
