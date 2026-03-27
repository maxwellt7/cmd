import { BusinessSubNav } from "../../../components/eos/business-sub-nav";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <BusinessSubNav />
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}
