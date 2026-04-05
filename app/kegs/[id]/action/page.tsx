"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionForm } from "@/components/ActionForm";
import { createMovement, updateKeg } from "@/lib/firestore";
import type { KegStatus } from "@/types/keg";
import type { MovementAction } from "@/types/movement";

const actions: MovementAction[] = ["check_in", "check_out", "fill", "empty", "ready_for_pickup", "maintenance", "lost"];

const actionToStatus: Record<MovementAction, KegStatus> = {
  check_in: "on_site",
  check_out: "off_site",
  fill: "on_site",
  empty: "empty",
  ready_for_pickup: "ready_for_pickup",
  maintenance: "maintenance",
  lost: "lost",
};

export default function KegActionPage({ params }: { params: { id: string } }) {
  const [selectedAction, setSelectedAction] = useState<MovementAction>("check_in");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">Update Keg</h1>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Action</span>
        <select
          value={selectedAction}
          onChange={(event) => setSelectedAction(event.target.value as MovementAction)}
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
        >
          {actions.map((action) => (
            <option key={action} value={action}>
              {action.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <ActionForm
        actionType={selectedAction}
        onSubmit={async (fields) => {
          setLoading(true);
          await updateKeg(params.id, {
            status: actionToStatus[selectedAction],
            updatedAt: new Date().toISOString(),
          });
          await createMovement({
            kegId: params.id,
            action: selectedAction,
            createdBy: "current-user",
            notes: JSON.stringify(fields),
            createdAt: new Date().toISOString(),
          });
          router.push(`/kegs/${params.id}`);
        }}
      />
      {loading && <p className="text-sm text-slate-500">Saving...</p>}
    </main>
  );
}
