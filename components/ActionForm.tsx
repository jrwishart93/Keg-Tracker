"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/firestore";
import { KEG_SCAN_LABELS } from "@/types/keg-event";
import type { KegScanType } from "@/types/keg-event";
import type { Keg } from "@/types/keg";

type FieldType = "text" | "date" | "select" | "notes" | "location-search";

interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  optional?: boolean;
  placeholder?: string;
}

const scanFields: Record<KegScanType, FieldConfig[]> = {
  CHECK_IN: [
    { key: "currentLocation", label: "Current Location", type: "location-search" },
    { key: "receivedBy", label: "Received By", type: "text", optional: true, placeholder: "Optional" },
    { key: "notes", label: "Notes", type: "notes", optional: true },
  ],
  CHECK_OUT: [
    { key: "destination", label: "Destination", type: "location-search", optional: true },
    { key: "customerName", label: "Customer / Site", type: "text", optional: true, placeholder: "Optional" },
    { key: "dispatchNote", label: "Dispatch Note", type: "notes", optional: true },
  ],
  WASH: [
    { key: "washType", label: "Wash Type", type: "select", options: ["Full Wash", "Rinse", "Line Clean"], optional: true },
    { key: "operator", label: "Operator", type: "text", optional: true, placeholder: "Optional" },
    { key: "notes", label: "Notes", type: "notes", optional: true },
  ],
  FILL: [
    { key: "productName", label: "Product Name", type: "select" },
    { key: "batchNumber", label: "Batch Number", type: "text", optional: true, placeholder: "Optional" },
    { key: "bestBefore", label: "Best Before Date", type: "date" },
    { key: "packagingDate", label: "Packaging Date", type: "date", optional: true },
    { key: "filledVolume", label: "Filled Volume", type: "text", optional: true, placeholder: "Optional" },
    { key: "notes", label: "Notes", type: "notes", optional: true },
  ],
  READY_FOR_PICKUP: [{ key: "notes", label: "Notes", type: "notes", optional: true }],
  PALLETIZE: [{ key: "notes", label: "Notes", type: "notes", optional: true }],
  CHANGE_RETURN_LOCATION: [{ key: "returnLocation", label: "New Return Location", type: "location-search" }],
  INTO_MAINTENANCE: [
    { key: "reason", label: "Reason", type: "notes", optional: true },
    { key: "notes", label: "Notes", type: "notes", optional: true },
  ],
  OUT_OF_MAINTENANCE: [
    { key: "repairNotes", label: "Repair Notes", type: "notes", optional: true },
    { key: "notes", label: "Notes", type: "notes", optional: true },
  ],
  LOST: [
    { key: "lastKnownLocation", label: "Last Known Location", type: "location-search", optional: true },
    { key: "notes", label: "Notes", type: "notes", optional: true },
  ],
  CHANGE_DATE_OF_MANUFACTURE: [{ key: "dateOfManufacture", label: "Date of Manufacture", type: "date" }],
  CHANGE_OF_LEASE: [{ key: "leaseName", label: "New Lease Name", type: "text" }],
  CHANGE_OF_OWNER: [{ key: "ownerName", label: "New Owner Name", type: "text" }],
  CHANGE_SERIAL_NUMBER: [{ key: "serialNumber", label: "New Serial Number", type: "text" }],
  CHANGE_ASSET_NUMBER: [{ key: "assetNumber", label: "New Asset Number", type: "text" }],
};

function toInputDate(value?: string | null) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
}

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function buildDefaultForm(keg: Keg) {
  return {
    currentLocation: keg.currentLocation ?? "Brewery",
    destination: keg.intendedLocation ?? "",
    customerName: keg.assignedCustomerId ?? "",
    productName: keg.productName ?? keg.beerName ?? keg.product ?? "",
    batchNumber: keg.batchNumber ?? keg.batch ?? "",
    bestBefore: toInputDate(keg.bestBefore ?? keg.bestBeforeDate),
    packagingDate: toInputDate(keg.filledAt ?? keg.packagingDate) || todayDate(),
    returnLocation: keg.returnLocation ?? "",
    dateOfManufacture: toInputDate(keg.dateOfManufacture),
    leaseName: keg.leaseName ?? "",
    ownerName: keg.ownerName ?? "",
    serialNumber: keg.serialNumber ?? "",
    assetNumber: keg.assetNumber ?? "",
  };
}

export function ActionForm({
  scanType,
  keg,
  locations,
  products,
  onSubmit,
}: {
  scanType: KegScanType;
  keg: Keg;
  locations: string[];
  products: Product[];
  onSubmit: (fields: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => buildDefaultForm(keg));
  const fields = useMemo(() => scanFields[scanType], [scanType]);

  function updateField(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function renderField(field: FieldConfig) {
    const commonInputClass = "field-shell mt-2 min-h-12 w-full rounded-[18px] px-4 text-slate-900";
    const value = form[field.key] ?? "";

    if (field.type === "select") {
      const options = field.key === "productName" ? products.map((product) => product.name) : (field.options ?? []);
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
          className="field-shell mt-2 w-full rounded-[18px] px-4 py-3 text-slate-900"
          value={value}
          rows={3}
          onChange={(event) => updateField(field.key, event.target.value)}
          placeholder={field.placeholder ?? (field.optional ? "Optional" : "")}
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
            placeholder={field.placeholder ?? "Search location or enter a new one"}
            required={!field.optional}
          />
          <datalist id="saved-locations">
            {locations.map((location) => (
              <option key={location} value={location} />
            ))}
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
        placeholder={field.placeholder}
        required={!field.optional}
      />
    );
  }

  const destructiveAction = scanType === "LOST";

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(form);
      }}
    >
      {fields.length > 0 ? (
        fields.map((field) => (
          <label key={field.key} className="block">
            <span className="section-kicker">{field.label}</span>
            {renderField(field)}
          </label>
        ))
      ) : (
        <div className="rounded-[18px] border border-black/8 bg-white/50 px-4 py-3 text-sm text-slate-600">
          This action only needs confirmation. Save to record it against this keg.
        </div>
      )}
      <button
        type="submit"
        className={`min-h-13 w-full rounded-full px-4 font-semibold text-white ${destructiveAction ? "bg-rose-700 shadow-[0_18px_30px_rgba(190,18,60,0.2)]" : "glow-button bg-[linear-gradient(135deg,#17212a,#324452)]"}`}
      >
        Save {KEG_SCAN_LABELS[scanType]}
      </button>
    </form>
  );
}
