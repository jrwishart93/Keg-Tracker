"use client";

import { useState } from "react";
import { createCustomerRequest } from "@/lib/firestore";
import type { CustomerRequestType } from "@/types/customer-request";

const requestLabels: Record<CustomerRequestType, string> = {
  reorder: "Order New Keg",
  refill: "Request Refill",
  replace: "Report Issue / Replace",
};

export function CustomerRequestActions({ kegId }: { kegId: string }) {
  const [submitting, setSubmitting] = useState<CustomerRequestType | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRequest(requestType: CustomerRequestType) {
    setSubmitting(requestType);
    setError("");
    setMessage("");

    try {
      await createCustomerRequest({ kegId, requestType });
      setMessage("Request sent to brewery.");
    } catch {
      setError("Could not send request right now. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {(Object.keys(requestLabels) as CustomerRequestType[]).map((requestType) => (
          <button
            key={requestType}
            type="button"
            onClick={() => void handleRequest(requestType)}
            disabled={submitting !== null}
            className="glow-button min-h-13 rounded-full bg-[linear-gradient(135deg,#17212a,#324452)] px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-65"
          >
            {submitting === requestType ? "Sending..." : requestLabels[requestType]}
          </button>
        ))}
      </div>

      {message ? <p className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
