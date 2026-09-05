"use client";

import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="border border-paper/30 px-4 py-2 text-xs uppercase tracking-widest2 text-paper transition-colors duration-250 hover:bg-paper hover:text-ink"
    >
      Logout
    </button>
  );
}
