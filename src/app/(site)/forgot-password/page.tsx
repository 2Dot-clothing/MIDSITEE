"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setMessage(data.message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer className="flex flex-col items-center gap-10">
      <SectionHeading
        title="Reset Password"
        align="center"
        description="Enter the email on your account and we'll send a link to reset your password."
      />
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
          disabled={!!message}
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-ink">
            {message}
          </p>
        )}

        <Button type="submit" disabled={submitting || !!message} className="w-full">
          {submitting ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>
      <p className="text-sm text-slate">
        <Link href="/login" className="text-ink underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </PageContainer>
  );
}
