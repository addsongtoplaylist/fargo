"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, UserPlus, X, Link as LinkIcon, Check, Loader2 } from "lucide-react";
import { getOrCreateInviteCode, removeTraveller } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Traveller = {
  id: string;
  display_name: string;
  role: string;
  account_id: string;
};

type OverviewPeopleProps = {
  tripId: string;
  travellers: Traveller[];
  plannerId: string;
  isPlanner: boolean;
};

export function OverviewPeople({
  tripId,
  travellers,
  plannerId,
  isPlanner,
}: OverviewPeopleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);

  // Sort: planner first, then alphabetical
  const sorted = [...travellers].sort((a, b) => {
    if (a.role === "planner") return -1;
    if (b.role === "planner") return 1;
    return a.display_name.localeCompare(b.display_name);
  });

  async function handleInvite() {
    setLoadingInvite(true);
    try {
      const code = await getOrCreateInviteCode(tripId);
      const url = `${window.location.origin}/invite/${code}`;
      setInviteUrl(url);
    } catch {
      toast("Failed to generate invite link.");
    } finally {
      setLoadingInvite(false);
    }
  }

  async function handleCopyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = inviteUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRemove(travellerId: string) {
    setRemoving(true);
    try {
      await removeTraveller(tripId, travellerId);
      router.refresh();
    } catch {
      toast("Failed to remove traveller.");
    } finally {
      setRemoving(false);
      setRemoveConfirmId(null);
      setSelectedId(null);
    }
  }

  const selectedTraveller = sorted.find((t) => t.id === selectedId);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-ink">
          Travellers ({travellers.length})
        </p>
      </div>

      {/* Traveller avatars — horizontal scroll if > 6 */}
      <div
        className={`flex gap-3 ${
          sorted.length > 6 ? "overflow-x-auto scrollbar-none pb-1" : "flex-wrap"
        }`}
      >
        {sorted.map((t) => {
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedId(isSelected ? null : t.id)}
              className={`flex flex-col items-center gap-1 shrink-0 transition-all ${
                isSelected ? "scale-105" : ""
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-accent text-accent-on ring-2 ring-accent ring-offset-2 ring-offset-card"
                    : "bg-accent/15 text-accent"
                }`}
              >
                {t.display_name[0]?.toUpperCase()}
              </div>
              <span className="text-[10px] text-muted max-w-[52px] truncate">
                {t.display_name.split(" ")[0]}
              </span>
              {t.role === "planner" && (
                <Crown size={10} className="text-amber-500 -mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Invite button — prominent, full-width (planner only) */}
      {isPlanner && !inviteUrl && (
        <button
          onClick={handleInvite}
          disabled={loadingInvite}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60"
        >
          {loadingInvite ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
          {loadingInvite ? "Generating…" : "Invite traveller"}
        </button>
      )}

      {/* Invite URL — shown after clicking Invite */}
      {inviteUrl && (
        <div className="bg-ground rounded-md border border-border p-2.5 mt-3">
          <p className="text-[11px] text-muted mb-1.5">
            Share this link — anyone with it can join:
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-card border border-border rounded px-2 py-1.5 text-[11px] text-ink truncate font-mono">
              {inviteUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="shrink-0 px-2.5 py-1.5 bg-accent text-accent-on text-[11px] font-medium rounded hover:bg-accent-hover transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check size={11} />
                  Copied
                </>
              ) : (
                <>
                  <LinkIcon size={11} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Selected traveller details */}
      {selectedTraveller && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-ink truncate">
              {selectedTraveller.display_name}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                selectedTraveller.role === "planner"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-ground text-muted"
              }`}
            >
              {selectedTraveller.role === "planner" ? "Planner" : "Member"}
            </span>
          </div>

          {/* Remove button — planner can remove members (not self) */}
          {isPlanner && selectedTraveller.role !== "planner" && (
            <button
              onClick={() => setRemoveConfirmId(selectedTraveller.id)}
              disabled={removing}
              className="text-xs text-money-over hover:text-money-over/80 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <X size={12} />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Info for members */}
      {!isPlanner && (
        <p className="text-[11px] text-muted text-center mt-3">
          Only the planner can invite or remove travellers.
        </p>
      )}

      <ConfirmDialog
        open={!!removeConfirmId}
        title="Remove traveller"
        message={`Are you sure you want to remove ${travellers.find((t) => t.id === removeConfirmId)?.display_name}?`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (removeConfirmId) return handleRemove(removeConfirmId);
        }}
        onCancel={() => setRemoveConfirmId(null)}
      />
    </div>
  );
}
