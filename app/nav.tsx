import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { SubmitButton } from "@/app/submit-button";

export function Nav({ email }: { email: string }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-700">
          <Link href="/dashboard" className="hover:text-zinc-950">
            Dashboard
          </Link>
          <Link href="/clients" className="hover:text-zinc-950">
            Clients
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-zinc-600">
          <span>{email}</span>
          <form action={signOut}>
            <SubmitButton
              pendingText="Signing out…"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </div>
    </header>
  );
}
