"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import { updateVtoSection } from "../../app/actions/eos";

const VTO_KEYS = [
  { key: "core_values", label: "Core Values" },
  { key: "core_focus", label: "Core Focus" },
  { key: "ten_year_target", label: "10-Year Target" },
  { key: "marketing_strategy", label: "Marketing Strategy" },
  { key: "three_year_picture", label: "3-Year Picture" },
  { key: "one_year_plan", label: "1-Year Plan" },
  { key: "quarterly_rocks", label: "Quarterly Rocks" },
  { key: "issues_list", label: "Issues List" },
];

interface VtoSectionData {
  id: string;
  sectionKey: string;
  content: string;
  version: number;
  updatedAt: string;
}

export function VtoEditor({ sections }: { sections: VtoSectionData[] }) {
  const [activeKey, setActiveKey] = useState(VTO_KEYS[0].key);
  const [saving, setSaving] = useState(false);

  const sectionMap = new Map(sections.map((s) => [s.sectionKey, s]));
  const current = sectionMap.get(activeKey);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Vision/Traction Organizer
        </h1>
        <p className="text-sm text-zinc-500">
          Define and refine your company vision
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="w-full lg:w-48 lg:shrink-0 flex lg:flex-col gap-1 lg:gap-0.5 overflow-x-auto lg:overflow-x-visible [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {VTO_KEYS.map((item) => {
            const section = sectionMap.get(item.key);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveKey(item.key)}
                className={cn(
                  "shrink-0 lg:shrink w-auto lg:w-full rounded-md px-3 py-2 text-left text-sm whitespace-nowrap transition-colors",
                  activeKey === item.key
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                )}
              >
                <span>{item.label}</span>
                {section && (
                  <span className="ml-1.5 text-[10px] text-zinc-600">
                    v{section.version}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Editor */}
        <div className="flex-1">
          <form
            action={async (formData) => {
              setSaving(true);
              await updateVtoSection(formData);
              setSaving(false);
            }}
            className="space-y-3"
          >
            <input type="hidden" name="sectionKey" value={activeKey} />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-200">
                {VTO_KEYS.find((k) => k.key === activeKey)?.label}
              </h2>
              {current && (
                <span className="text-xs text-zinc-600">
                  Version {current.version} &middot; Last updated{" "}
                  {new Date(current.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <textarea
              name="content"
              key={activeKey}
              defaultValue={current?.content ?? ""}
              rows={16}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              placeholder={`Write your ${VTO_KEYS.find((k) => k.key === activeKey)?.label.toLowerCase()} here...`}
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              {current && (
                <span className="text-xs text-zinc-600">
                  Changes are versioned automatically
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
