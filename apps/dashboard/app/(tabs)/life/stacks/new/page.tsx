import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@cmd/ui";
import { getUserByClerkId } from "../../../../actions/user";
import { createStackSession } from "../../../../actions/stacks";

export const dynamic = "force-dynamic";

const STACK_META: Record<string, { label: string; color: string; bg: string; icon: string; questionCount: number; description: string }> = {
  gratitude: { label: "Gratitude", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: "\u2728", questionCount: 15, description: "Cultivate appreciation and recognize positive patterns" },
  idea: { label: "Idea", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: "\uD83D\uDCA1", questionCount: 25, description: "Transform insights into actionable plans" },
  discover: { label: "Discover", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20", icon: "\uD83D\uDD2D", questionCount: 14, description: "Explore transformative lessons from experiences" },
  angry: { label: "Angry", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: "\uD83D\uDD25", questionCount: 22, description: "Transform anger into empowerment" },
};

const CORE4_DOMAINS = [
  { value: "mind", label: "Mind", color: "text-blue-400", ring: "ring-blue-500" },
  { value: "body", label: "Body", color: "text-emerald-400", ring: "ring-emerald-500" },
  { value: "being", label: "Being", color: "text-violet-400", ring: "ring-violet-500" },
  { value: "balance", label: "Balance", color: "text-amber-400", ring: "ring-amber-500" },
];

export default async function NewStackPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(clerkId);
  if (!dbUser) redirect("/sign-in");

  const { type } = await searchParams;
  const stackType = type && type in STACK_META ? type : "gratitude";
  const meta = STACK_META[stackType]!;

  async function handleCreate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const core4Domain = formData.get("core4Domain") as string;
    const subjectEntity = formData.get("subjectEntity") as string;

    if (!title || !core4Domain) return;

    formData.set("stackType", stackType);
    formData.set("userId", dbUser!.id);

    const session = await createStackSession(formData);
    if (session?.id) {
      redirect(`/life/stacks/${session.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/life/stacks"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Stacks
      </Link>

      {/* Stack Type Header */}
      <div className={cn("rounded-xl border p-5", meta.bg)}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <h1 className={cn("text-xl font-bold", meta.color)}>{meta.label} Stack</h1>
            <p className="text-sm text-zinc-400">{meta.description}</p>
            <p className="mt-0.5 text-xs text-zinc-600">{meta.questionCount} questions</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form action={handleCreate} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Give this stack a name..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
        </div>

        {/* CORE 4 Domain */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-zinc-300">CORE 4 Domain</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CORE4_DOMAINS.map((domain) => (
              <label
                key={domain.value}
                className="group cursor-pointer"
              >
                <input
                  type="radio"
                  name="core4Domain"
                  value={domain.value}
                  required
                  className="peer sr-only"
                />
                <div className={cn(
                  "rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-center text-sm font-medium transition-all",
                  "peer-checked:border-zinc-600 peer-checked:bg-zinc-800",
                  "hover:border-zinc-700"
                )}>
                  <span className={cn("transition-colors", domain.color)}>
                    {domain.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Subject Entity */}
        <div>
          <label htmlFor="subjectEntity" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Who/What are you stacking?
          </label>
          <input
            id="subjectEntity"
            name="subjectEntity"
            type="text"
            placeholder="Person, situation, concept..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={cn(
            "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
            stackType === "gratitude" && "bg-emerald-600 hover:bg-emerald-500",
            stackType === "idea" && "bg-blue-600 hover:bg-blue-500",
            stackType === "discover" && "bg-violet-600 hover:bg-violet-500",
            stackType === "angry" && "bg-red-600 hover:bg-red-500"
          )}
        >
          Begin Stack
        </button>
      </form>
    </div>
  );
}
