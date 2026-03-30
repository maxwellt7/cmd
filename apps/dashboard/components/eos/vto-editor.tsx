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

export function VtoEditor({
  sections,
  companyId,
}: {
  sections: VtoSectionData[];
  companyId: string;
}) {
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
          <div className="flex items-center justify-between mb-3">
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

          <SectionEditor
            key={activeKey}
            sectionKey={activeKey}
            content={current?.content ?? ""}
            companyId={companyId}
            saving={saving}
            onSave={() => setSaving(true)}
            onSaved={() => setSaving(false)}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section-specific editor
// ---------------------------------------------------------------------------

function SectionEditor({
  sectionKey,
  content,
  companyId,
  saving,
  onSave,
  onSaved,
}: {
  sectionKey: string;
  content: string;
  companyId: string;
  saving: boolean;
  onSave: () => void;
  onSaved: () => void;
}) {
  switch (sectionKey) {
    case "core_values":
      return (
        <CoreValuesEditor
          content={content}
          companyId={companyId}
          saving={saving}
          onSave={onSave}
          onSaved={onSaved}
        />
      );
    case "core_focus":
      return (
        <CoreFocusEditor
          content={content}
          companyId={companyId}
          saving={saving}
          onSave={onSave}
          onSaved={onSaved}
        />
      );
    case "ten_year_target":
      return (
        <SingleLineEditor
          sectionKey="ten_year_target"
          content={content}
          companyId={companyId}
          saving={saving}
          onSave={onSave}
          onSaved={onSaved}
          placeholder="What is your 10-year target?"
        />
      );
    case "marketing_strategy":
      return (
        <MarketingStrategyEditor
          content={content}
          companyId={companyId}
          saving={saving}
          onSave={onSave}
          onSaved={onSaved}
        />
      );
    default:
      return (
        <TextareaEditor
          sectionKey={sectionKey}
          content={content}
          companyId={companyId}
          saving={saving}
          onSave={onSave}
          onSaved={onSaved}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Core Values — list of single-line text inputs
// ---------------------------------------------------------------------------

function CoreValuesEditor({
  content,
  companyId,
  saving,
  onSave,
  onSaved,
}: {
  content: string;
  companyId: string;
  saving: boolean;
  onSave: () => void;
  onSaved: () => void;
}) {
  const initial = content ? content.split("\n").filter(Boolean) : [""];
  const [values, setValues] = useState<string[]>(initial);

  function addValue() {
    setValues([...values, ""]);
  }

  function removeValue(idx: number) {
    setValues(values.filter((_, i) => i !== idx));
  }

  function updateValue(idx: number, val: string) {
    const next = [...values];
    next[idx] = val;
    setValues(next);
  }

  return (
    <form
      action={async (formData) => {
        onSave();
        await updateVtoSection(formData);
        onSaved();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="sectionKey" value="core_values" />
      <input type="hidden" name="content" value={values.filter(Boolean).join("\n")} />

      <div className="space-y-2">
        {values.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 w-5 text-right shrink-0">
              {idx + 1}.
            </span>
            <input
              value={val}
              onChange={(e) => updateValue(idx, e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              placeholder="Core value..."
            />
            <button
              type="button"
              onClick={() => removeValue(idx)}
              className="shrink-0 text-xs text-zinc-700 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addValue}
        className="rounded-md border border-dashed border-zinc-700 px-3 py-1.5 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
      >
        + Add Value
      </button>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <span className="text-xs text-zinc-600">Changes are versioned automatically</span>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Core Focus — two single-line inputs
// ---------------------------------------------------------------------------

function CoreFocusEditor({
  content,
  companyId,
  saving,
  onSave,
  onSaved,
}: {
  content: string;
  companyId: string;
  saving: boolean;
  onSave: () => void;
  onSaved: () => void;
}) {
  // Store as JSON: { purpose: "", niche: "" }
  let parsed = { purpose: "", niche: "" };
  try {
    parsed = JSON.parse(content);
  } catch {
    // If old-style plain text, put it in purpose
    if (content) parsed.purpose = content;
  }

  const [purpose, setPurpose] = useState(parsed.purpose ?? "");
  const [niche, setNiche] = useState(parsed.niche ?? "");

  return (
    <form
      action={async (formData) => {
        onSave();
        await updateVtoSection(formData);
        onSaved();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="sectionKey" value="core_focus" />
      <input
        type="hidden"
        name="content"
        value={JSON.stringify({ purpose, niche })}
      />

      <div>
        <label className="mb-1 block text-xs text-zinc-500">
          Purpose / Cause / Passion
        </label>
        <input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          placeholder="Why does your company exist?"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Our Niche</label>
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          placeholder="What is your niche?"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <span className="text-xs text-zinc-600">Changes are versioned automatically</span>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Single line editor (10-year target)
// ---------------------------------------------------------------------------

function SingleLineEditor({
  sectionKey,
  content,
  companyId,
  saving,
  onSave,
  onSaved,
  placeholder,
}: {
  sectionKey: string;
  content: string;
  companyId: string;
  saving: boolean;
  onSave: () => void;
  onSaved: () => void;
  placeholder: string;
}) {
  return (
    <form
      action={async (formData) => {
        onSave();
        await updateVtoSection(formData);
        onSaved();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="sectionKey" value={sectionKey} />
      <input
        name="content"
        defaultValue={content}
        className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
        placeholder={placeholder}
      />

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <span className="text-xs text-zinc-600">Changes are versioned automatically</span>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Marketing Strategy — multiple sections
// ---------------------------------------------------------------------------

function MarketingStrategyEditor({
  content,
  companyId,
  saving,
  onSave,
  onSaved,
}: {
  content: string;
  companyId: string;
  saving: boolean;
  onSave: () => void;
  onSaved: () => void;
}) {
  let parsed = { targetMarket: "", threeUniques: "", provenProcess: "", guarantee: "" };
  try {
    parsed = JSON.parse(content);
  } catch {
    if (content) parsed.targetMarket = content;
  }

  const [targetMarket, setTargetMarket] = useState(parsed.targetMarket ?? "");
  const [threeUniques, setThreeUniques] = useState(parsed.threeUniques ?? "");
  const [provenProcess, setProvenProcess] = useState(parsed.provenProcess ?? "");
  const [guarantee, setGuarantee] = useState(parsed.guarantee ?? "");

  return (
    <form
      action={async (formData) => {
        onSave();
        await updateVtoSection(formData);
        onSaved();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="sectionKey" value="marketing_strategy" />
      <input
        type="hidden"
        name="content"
        value={JSON.stringify({ targetMarket, threeUniques, provenProcess, guarantee })}
      />

      <div>
        <label className="mb-1 block text-xs text-zinc-500">Target Market</label>
        <textarea
          value={targetMarket}
          onChange={(e) => setTargetMarket(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          placeholder="Who is your ideal customer?"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">3 Uniques</label>
        <textarea
          value={threeUniques}
          onChange={(e) => setThreeUniques(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          placeholder="What are your 3 uniques?"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Proven Process</label>
        <input
          value={provenProcess}
          onChange={(e) => setProvenProcess(e.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          placeholder="Your proven process name"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Guarantee</label>
        <input
          value={guarantee}
          onChange={(e) => setGuarantee(e.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          placeholder="What do you guarantee?"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <span className="text-xs text-zinc-600">Changes are versioned automatically</span>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Generic textarea editor (3-year picture, 1-year plan, quarterly rocks, issues list)
// ---------------------------------------------------------------------------

function TextareaEditor({
  sectionKey,
  content,
  companyId,
  saving,
  onSave,
  onSaved,
}: {
  sectionKey: string;
  content: string;
  companyId: string;
  saving: boolean;
  onSave: () => void;
  onSaved: () => void;
}) {
  const label = VTO_KEYS.find((k) => k.key === sectionKey)?.label ?? sectionKey;

  return (
    <form
      action={async (formData) => {
        onSave();
        await updateVtoSection(formData);
        onSaved();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="sectionKey" value={sectionKey} />
      <textarea
        name="content"
        defaultValue={content}
        rows={16}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
        placeholder={`Write your ${label.toLowerCase()} here...`}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <span className="text-xs text-zinc-600">Changes are versioned automatically</span>
      </div>
    </form>
  );
}
