import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearError, register as registerThunk } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account · LostFound+" },
      {
        name: "description",
        content:
          "Create a free LostFound+ account to report lost or found items and track claims in your community.",
      },
      { property: "og:title", content: "Create your account · LostFound+" },
      {
        property: "og:description",
        content: "Report lost or found items and track claims in your community.",
      },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email address").max(255),
    password: z.string().min(6, "Use at least 6 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user, hydrated } = useAppSelector((s) => s.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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

  const handleName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);
  const handleEmail = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handlePassword = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const handleConfirm = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, password, confirm });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    const result = await dispatch(registerThunk({ name: parsed.data.name, email: parsed.data.email, password: parsed.data.password }));
    if (registerThunk.fulfilled.match(result)) {
      toast.success("Account created. Welcome to LostFound+!");
      navigate({ to: "/dashboard" });
    } else {
      toast.error("We couldn't create your account. Please try again.");
    }
  };

  return (
    <div className="container-page grid max-w-5xl gap-10 py-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Join the community desk</h1>
        <p className="text-muted-foreground">
          One account lets you report items, open claims and get notified the moment something
          matches.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>· Your contact details stay private — messaging happens in-app.</li>
          <li>· Every claim is reviewed by a moderator before handover.</li>
          <li>· Track the status of each report from a single dashboard.</li>
        </ul>
      </div>

      <Card className="p-6 shadow-card sm:p-8">
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" type="text" autoComplete="name" placeholder="Jane Doe" value={name} onChange={handleName} aria-invalid={!!errors["name"]} />
            {errors["name"] ? <p className="text-xs text-destructive">{errors["name"]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@community.org" value={email} onChange={handleEmail} aria-invalid={!!errors["email"]} />
            {errors["email"] ? <p className="text-xs text-destructive">{errors["email"]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={password} onChange={handlePassword} aria-invalid={!!errors["password"]} />
            {errors["password"] ? <p className="text-xs text-destructive">{errors["password"]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="Repeat password" value={confirm} onChange={handleConfirm} aria-invalid={!!errors["confirm"]} />
            {errors["confirm"] ? <p className="text-xs text-destructive">{errors["confirm"]}</p> : null}
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
              <UserPlus className="size-4" />
            )}
            Create account
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
