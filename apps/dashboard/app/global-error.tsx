"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-zinc-50 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <button
            onClick={() => reset()}
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
