interface AuthConfigNoticeProps {
  mode: "sign-in" | "sign-up";
}

const COPY: Record<AuthConfigNoticeProps["mode"], { title: string; body: string }> = {
  "sign-in": {
    title: "Authentication is not configured",
    body:
      "Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable Clerk sign-in for this dashboard.",
  },
  "sign-up": {
    title: "Authentication is not configured",
    body:
      "Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable Clerk sign-up for this dashboard.",
  },
};

export function AuthConfigNotice({ mode }: AuthConfigNoticeProps) {
  const copy = COPY[mode];

  return (
    <div className="max-w-md rounded-2xl border border-amber-500/30 bg-zinc-950 p-6 text-left shadow-xl shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
        Clerk setup required
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-zinc-50">{copy.title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{copy.body}</p>
      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 font-mono text-xs text-zinc-300">
        <div>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=&lt;your-key&gt;</div>
        <div>CLERK_SECRET_KEY=&lt;your-secret&gt;</div>
      </div>
      <p className="mt-4 text-sm text-zinc-500">
        Until those variables are present, the app runs in local preview mode so the dashboard UI can still build and render.
      </p>
    </div>
  );
}
