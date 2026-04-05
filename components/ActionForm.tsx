"use client";

import { useMemo, useState } from "react";
import type { MovementAction } from "@/types/movement";

const actionFields: Record<MovementAction, string[]> = {
  check_in: ["Current location", "Notes"],
  check_out: ["From location", "To location", "Carrier/driver", "Notes"],
  fill: ["Location", "Product", "Beer name", "Batch", "ABV", "Packaging date", "Best before", "Brewer"],
  empty: ["Location", "Notes"],
  ready_for_pickup: ["Current location", "Next location", "Collection note"],
  maintenance: ["Location", "Issue description", "Notes"],
  lost: ["Last known location", "Date flagged", "Notes"],
};

export function ActionForm({
  actionType,
  onSubmit,
}: {
  actionType: MovementAction;
  onSubmit: (fields: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  const fields = useMemo(() => actionFields[actionType], [actionType]);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(form);
      }}
    >
      {fields.map((field) => (
        <label key={field} className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{field}</span>
          <input
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
            value={form[field] ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
          />
        </label>
      ))}
      <button type="submit" className="min-h-11 w-full rounded-lg bg-slate-900 px-4 font-semibold text-white">
        Submit action
      </button>
    </form>
  );
}
