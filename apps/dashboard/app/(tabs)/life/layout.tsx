import { LifeSubNav } from "../../../components/life/sub-nav";

export default function LifeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-5 py-2">
        <LifeSubNav />
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}
