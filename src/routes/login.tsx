import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearError, login } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · LostFound+" },
      {
        name: "description",
        content: "Sign in to LostFound+ to manage your reports, claims and notifications.",
      },
      { property: "og:title", content: "Sign in · LostFound+" },
      { property: "og:description", content: "Manage your lost and found reports and claims." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user, hydrated } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const didClearError = useRef(false);

  // Redirect if already logged in (Navbar handles hydration)
  useEffect(() => {
    if (hydrated && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [hydrated, user, navigate]);

  // Clear stale auth errors once on mount
  useEffect(() => {
    if (!didClearError.current) {
      didClearError.current = true;
      dispatch(clearError());
    }
  }, [dispatch]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    const result = await dispatch(login(parsed.data));
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}`);
      navigate({ to: "/dashboard" });
    } else {
      toast.error("Sign in failed. Check your credentials and try again.");
    }
  };

  return (
    <div className="container-page grid max-w-5xl gap-10 py-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to track your reports, respond to claims and see match notifications.
        </p>
        <div className="rounded-xl border border-dashed border-border bg-surface/60 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Demo access</p>
          <p className="mt-1">
            Any email works while the backend is offline. Use an address starting with{" "}
            <code className="rounded bg-card px-1 py-0.5 text-xs">admin</code> to preview the
            moderator console.
          </p>
        </div>
      </div>

      <Card className="p-6 shadow-card sm:p-8">
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              aria-invalid={!!errors["email"]}
              placeholder="you@community.org"
            />
            {errors["email"] ? (
              <p className="text-xs text-destructive">{errors["email"]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              aria-invalid={!!errors["password"]}
              placeholder="••••••••"
            />
            {errors["password"] ? (
              <p className="text-xs text-destructive">{errors["password"]}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {typeof error === "string" ? error : (error as any)?.message || String(error)}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            Sign in
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
