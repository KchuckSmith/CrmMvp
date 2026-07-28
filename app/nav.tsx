"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/app/user-menu";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
];

export function Nav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="bg-white">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-3 items-center px-6 py-3">
        <Link href="/dashboard" className="justify-self-start">
          <Image
            src="/images/Fuller.webp"
            alt="Fuller & Sons"
            width={300}
            height={187}
            className="h-14 w-auto"
            priority
          />
        </Link>
        <span className="justify-self-center font-serif text-2xl font-bold tracking-tight text-black">
          Fuller &amp; Sons Command
        </span>
        <div className="flex items-center gap-6 justify-self-end">
          <nav className="flex items-center gap-6 text-sm font-bold tracking-wide uppercase">
            {NAV_LINKS.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive
                      ? "text-red-600"
                      : "text-black hover:text-red-600"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <UserMenu email={email} />
        </div>
      </div>
      <div className="h-1 bg-black" />
    </header>
  );
}
