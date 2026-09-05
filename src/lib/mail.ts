// No email provider is wired up yet — 2DOT doesn't have SMTP/Resend/SendGrid
// credentials configured. In development this just logs the link to the
// server console so the forgot-password flow can be tested end to end.
//
// To go live: replace the body of this function with a real provider call
// (e.g. Resend's `resend.emails.send(...)` or an SMTP transport via
// nodemailer) and keep the same signature so nothing else has to change.
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[2DOT] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  // In production, fail loudly rather than silently pretending an email
  // went out — better to surface the missing integration than to have
  // customers wait on an email that never arrives.
  console.error(
    "[2DOT] sendPasswordResetEmail called in production with no email provider configured."
  );
}
