"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Client component: credentials sign-in has to happen in the browser via
// next-auth's signIn(), and we want inline validation errors rather than a
// full page reload on a failed login.
// useSearchParams() requires a Suspense boundary during static rendering,
// so the actual form lives in a child component below.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (!result || result.error) {
      // Deliberately generic — never confirm whether the email exists.
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <PageContainer className="flex flex-col items-center gap-10">
      <SectionHeading title="Log In" align="center" />
      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-sm flex-col gap-5">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Logging In…" : "Log In"}
        </Button>

        <Link
          href="/forgot-password"
          className="text-center text-xs uppercase tracking-widest2 text-slate underline underline-offset-4"
        >
          Forgot password?
        </Link>
      </form>
      <p className="text-sm text-slate">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-ink underline underline-offset-4">
          Register
        </Link>
      </p>
    </PageContainer>
  );
}
