import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearError, hydrate, register as registerThunk } from "@/store/authSlice";
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
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!hydrated) dispatch(hydrate());
  }, [hydrated, dispatch]);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    const { name, email, password } = parsed.data;
    const result = await dispatch(registerThunk({ name, email, password }));
    if (registerThunk.fulfilled.match(result)) {
      toast.success("Account created. Welcome to LostFound+!");
      navigate({ to: "/dashboard" });
    } else {
      toast.error("We couldn't create your account. Please try again.");
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type: string,
    placeholder: string,
    autoComplete: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        aria-invalid={!!errors[id]}
      />
      {errors[id] ? <p className="text-xs text-destructive">{errors[id]}</p> : null}
    </div>
  );

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
          {field("name", "Full name", "text", "Jane Doe", "name")}
          {field("email", "Email address", "email", "you@community.org", "email")}
          {field("password", "Password", "password", "At least 6 characters", "new-password")}
          {field("confirm", "Confirm password", "password", "Repeat password", "new-password")}

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
