"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import { addResource, updateResource, deleteResource } from "../../app/actions/eos";

const RESOURCE_TYPES = [
  { value: "training", label: "Training", color: "bg-blue-500/10 text-blue-400" },
  { value: "lesson", label: "Lesson", color: "bg-emerald-500/10 text-emerald-400" },
  { value: "document", label: "Document", color: "bg-amber-500/10 text-amber-400" },
  { value: "link", label: "Link", color: "bg-purple-500/10 text-purple-400" },
  { value: "video", label: "Video", color: "bg-red-500/10 text-red-400" },
] as const;

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: string;
  content: string;
  attachmentUrl: string | null;
  category: string | null;
}

export function ResourceManager({
  resources,
  companyId,
}: {
  resources: ResourceItem[];
  companyId: string;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  // Group by category
  const categories = new Map<string, ResourceItem[]>();
  const filtered = filterType === "all"
    ? resources
    : resources.filter((r) => r.type === filterType);

  for (const r of filtered) {
    const cat = r.category || "Uncategorized";
    const list = categories.get(cat) ?? [];
    list.push(r);
    categories.set(cat, list);
  }

  const sortedCategories = Array.from(categories.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Resources</h1>
          <p className="text-sm text-zinc-500">
            Trainings, documents, and reference material
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
        >
          {showAddForm ? "Cancel" : "+ Add Resource"}
        </button>
      </div>

      {showAddForm && (
        <form
          action={async (formData) => {
            await addResource(formData);
            setShowAddForm(false);
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 md:p-4 space-y-3"
        >
          <input type="hidden" name="companyId" value={companyId} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">Title</label>
              <input
                name="title"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="Resource title"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Type</label>
              <select
                name="type"
                defaultValue="training"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Category</label>
              <input
                name="category"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="e.g. Onboarding, Sales, Ops"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">Description</label>
              <input
                name="description"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="Brief description"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">Content</label>
              <textarea
                name="content"
                rows={4}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="Full content, notes, or URL..."
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">
                Attachment URL (optional)
              </label>
              <input
                name="attachmentUrl"
                type="url"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Add Resource
          </button>
        </form>
      )}

      {/* Filter by type */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setFilterType("all")}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            filterType === "all"
              ? "bg-zinc-800 text-zinc-200"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          All
        </button>
        {RESOURCE_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFilterType(t.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filterType === t.value
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">No resources yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Add trainings, documents, and links for your team
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map(([category, items]) => (
            <CategorySection key={category} category={category} items={items} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible category section
// ---------------------------------------------------------------------------

function CategorySection({
  category,
  items,
}: {
  category: string;
  items: ResourceItem[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left"
      >
        <svg
          className={cn("h-3 w-3 text-zinc-600 transition-transform", open && "rotate-90")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          {category}{" "}
          <span className="text-zinc-600">({items.length})</span>
        </h2>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <ResourceCard key={item.id} resource={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resource card — expandable with edit/delete
// ---------------------------------------------------------------------------

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeInfo = RESOURCE_TYPES.find((t) => t.value === resource.type);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 md:p-4 space-y-2">
      <button
        type="button"
        onClick={() => {
          setExpanded(!expanded);
          setEditing(false);
          setConfirmDelete(false);
        }}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-200 break-words">
              {resource.title}
            </h3>
            {typeInfo && (
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                  typeInfo.color
                )}
              >
                {typeInfo.label}
              </span>
            )}
          </div>
          {resource.description && !expanded && (
            <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
              {resource.description}
            </p>
          )}
        </div>
        <svg
          className={cn("h-3 w-3 shrink-0 text-zinc-600 transition-transform mt-1", expanded && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && !editing && (
        <div className="space-y-2 pt-1">
          {resource.description && (
            <p className="text-xs text-zinc-400">{resource.description}</p>
          )}
          {resource.content && (
            <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
              <pre className="whitespace-pre-wrap text-xs text-zinc-300 break-words">
                {resource.content}
              </pre>
            </div>
          )}
          {resource.attachmentUrl && (
            <a
              href={resource.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              Attachment link
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
            >
              Edit
            </button>
            {confirmDelete ? (
              <form action={deleteResource}>
                <input type="hidden" name="id" value={resource.id} />
                <button
                  type="submit"
                  className="rounded-md bg-red-500/10 px-3 py-1 text-xs text-red-400 hover:bg-red-500/20"
                >
                  Confirm Delete
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-zinc-700 hover:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {expanded && editing && (
        <form
          action={async (formData) => {
            await updateResource(formData);
            setEditing(false);
          }}
          className="space-y-2 pt-1"
        >
          <input type="hidden" name="id" value={resource.id} />
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Title</label>
            <input
              name="title"
              defaultValue={resource.title}
              required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Type</label>
              <select
                name="type"
                defaultValue={resource.type}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Category</label>
              <input
                name="category"
                defaultValue={resource.category ?? ""}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Description</label>
            <input
              name="description"
              defaultValue={resource.description}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Content</label>
            <textarea
              name="content"
              defaultValue={resource.content}
              rows={4}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Attachment URL</label>
            <input
              name="attachmentUrl"
              type="url"
              defaultValue={resource.attachmentUrl ?? ""}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="rounded-md bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md px-3 py-1 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
