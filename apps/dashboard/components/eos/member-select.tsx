"use client";

interface MemberOption {
  id: string;
  name: string;
  email: string;
}

interface MemberSelectProps {
  members: MemberOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
}

export function MemberSelect({
  members,
  value,
  onChange,
  name,
  placeholder = "Select a member...",
}: MemberSelectProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
    >
      <option value="">{placeholder}</option>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name} ({member.email})
        </option>
      ))}
    </select>
  );
}
