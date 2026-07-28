"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  pendingText = "Saving…",
  className = "",
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
