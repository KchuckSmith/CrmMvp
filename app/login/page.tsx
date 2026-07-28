import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <h1 className="text-xl font-semibold text-zinc-900">
          Job Tracker CRM
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
