"use client";

import { useMemo, useState } from "react";
import type { MovementAction } from "@/types/movement";
import type { Product } from "@/lib/firestore";

type FieldType = "text" | "date" | "select" | "notes" | "location-search";

interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  optional?: boolean;
}

const actionFields: Record<MovementAction, FieldConfig[]> = {
  fill: [
    { key: "currentLocation", label: "Current Location", type: "select", options: ["Brewery", "b.social / Tap Room"] },
    { key: "product", label: "Product", type: "select" },
    { key: "brewer", label: "Brewer", type: "text" },
    { key: "beerName", label: "Beer Name", type: "text" },
    { key: "batch", label: "Batch", type: "text" },
    { key: "abv", label: "Beer ABV", type: "text" },
    { key: "packagingDate", label: "Packaging Date", type: "date" },
    { key: "bestBeforeDate", label: "Best Before Date", type: "date" },
  ],
  deliver: [
    { key: "currentLocation", label: "Current Location", type: "select", options: ["Brewery", "b.social / Tap Room"] },
    { key: "nextLocation", label: "Next Location", type: "location-search" },
    { key: "carrier", label: "Carrier", type: "text" },
  ],
  return: [
    { key: "currentLocation", label: "Current Location", type: "select", options: ["Brewery", "b.social / Tap Room"] },
    { key: "nextLocation", label: "Next Location", type: "location-search" },
    { key: "condition", label: "Condition", type: "select", options: ["Full", "Empty", "Damaged"] },
  ],
  empty: [
    { key: "currentLocation", label: "Current Location", type: "select", options: ["Brewery", "b.social / Tap Room"] },
    { key: "notes", label: "Notes", type: "notes", optional: true },
  ],
  maintenance: [
    { key: "currentLocation", label: "Current Location", type: "select", options: ["Brewery", "b.social / Tap Room"] },
    { key: "notes", label: "Notes / reason", type: "notes" },
  ],
  lost: [
    { key: "lastKnownLocation", label: "Last Known Location", type: "location-search" },
    { key: "notes", label: "Notes", type: "notes" },
  ],
};

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function plusDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function buildDefaultForm() {
  const packagingDate = todayDate();
  return {
    currentLocation: "Brewery",
    packagingDate,
    bestBeforeDate: plusDays(packagingDate, 90),
  };
}

export function ActionForm({
  actionType,
  locations,
  products,
  onSubmit,
}: {
  actionType: MovementAction;
  locations: string[];
  products: Product[];
  onSubmit: (fields: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState<Record<string, string>>(buildDefaultForm());
  const fields = useMemo(() => actionFields[actionType], [actionType]);

  function updateField(key: string, value: string) {
    if (key === "product" && actionType === "fill") {
      const selectedProduct = products.find((product) => product.name === value);
      setForm((prev) => ({
        ...prev,
        [key]: value,
        beerName: selectedProduct ? selectedProduct.name : prev.beerName,
        abv: selectedProduct ? selectedProduct.abv.toString() : prev.abv,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function renderField(field: FieldConfig) {
    const commonInputClass = "mt-1 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-900";
    const value = form[field.key] ?? "";

    if (field.type === "select") {
      const options = field.key === "product" ? products.map((product) => product.name) : (field.options ?? []);
      return (
        <select
          className={commonInputClass}
          value={value}
          onChange={(event) => updateField(field.key, event.target.value)}
          required={!field.optional}
        >
          <option value="">Select {field.label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "notes") {
      return (
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900"
          value={value}
          rows={3}
          onChange={(event) => updateField(field.key, event.target.value)}
          placeholder={field.optional ? "Optional" : ""}
          required={!field.optional}
        />
      );
    }

    if (field.type === "location-search") {
      return (
        <>
          <input
            list="saved-locations"
            className={commonInputClass}
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            placeholder="Search location or add new location"
            required={!field.optional}
          />
          <datalist id="saved-locations">
            {locations.map((location) => (
              <option key={location} value={location} />
            ))}
            <option value="Add new location" />
          </datalist>
        </>
      );
    }

    return (
      <input
        type={field.type}
        className={commonInputClass}
        value={value}
        onChange={(event) => updateField(field.key, event.target.value)}
        required={!field.optional}
      />
    );
  }

  const destructiveAction = actionType === "lost";

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(form);
      }}
    >
      {fields.map((field) => (
        <label key={field.key} className="block">
          <span className="block text-xs font-semibold tracking-[0.12em] text-slate-500">{field.label.toUpperCase()}</span>
          {renderField(field)}
        </label>
      ))}
      <button
        type="submit"
        className={`min-h-12 w-full rounded-lg px-4 font-semibold text-white ${destructiveAction ? "bg-rose-700" : "bg-[#131E29]"}`}
      >
        Submit
      </button>
    </form>
  );
}
