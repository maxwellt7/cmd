import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">{"\u26A1"} CMD</h1>
        <SignIn />
      </div>
    </div>
  );
}
