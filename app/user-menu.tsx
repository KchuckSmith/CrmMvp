"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/login/actions";
import { SubmitButton } from "@/app/submit-button";

export function UserMenu({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-black hover:bg-black hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <polygon points="12,2 14.35,8.76 21.51,8.91 15.8,13.24 17.88,20.09 12,16 6.12,20.09 8.2,13.24 2.49,8.91 9.65,8.76" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 rounded-md border border-zinc-200 bg-white py-1 shadow-md"
        >
          <div className="truncate border-b border-zinc-200 px-3 py-2 text-sm text-zinc-500">
            {email}
          </div>
          <form action={signOut}>
            <SubmitButton
              pendingText="Signing out…"
              className="w-full px-3 py-2 text-left text-sm font-medium text-black hover:bg-zinc-50"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
