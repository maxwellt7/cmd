import { UserButton } from "@clerk/nextjs";
import { isClerkConfigured } from "../lib/clerk";

export function UserMenu() {
  if (!isClerkConfigured) {
    return (
      <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
        Local preview
      </div>
    );
  }

  return <UserButton />;
}
