import { SignIn } from "@clerk/nextjs";
import { AuthConfigNotice } from "../../../components/auth-config-notice";
import { isClerkConfigured } from "../../../lib/clerk";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6">
      <div className="text-center">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">{"\u26A1"} CMD</h1>
        {isClerkConfigured ? <SignIn /> : <AuthConfigNotice mode="sign-in" />}
      </div>
    </div>
  );
}
