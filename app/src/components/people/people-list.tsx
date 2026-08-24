"use client";

import { useState } from "react";
import { UserPlus, Crown, X, Link, Check } from "lucide-react";
import { getOrCreateInviteCode, removeTraveller } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useRouter } from "next/navigation";

type Traveller = {
  id: string;
  display_name: string;
  role: string;
  account_id: string;
};

type PeopleListProps = {
  tripId: string;
  travellers: Traveller[];
  plannerId: string;
  isPlanner: boolean;
};

export function PeopleList({
  tripId,
  travellers,
  plannerId,
  isPlanner,
}: PeopleListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);

  async function handleGenerateInvite() {
    setLoadingInvite(true);
    try {
      const code = await getOrCreateInviteCode(tripId);
      const url = `${window.location.origin}/invite/${code}`;
      setInviteUrl(url);
    } catch (err) {
      console.error(err);
      toast("Failed to generate invite link. Please try again.");
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
    if (removing) return;
    setRemoving(travellerId);
    try {
      await removeTraveller(tripId, travellerId);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast("Failed to remove traveller. Please try again.");
    } finally {
      setRemoving(null);
      setRemoveConfirmId(null);
    }
  }

  // Sort: planner first, then alphabetical
  const sorted = [...travellers].sort((a, b) => {
    if (a.role === "planner") return -1;
    if (b.role === "planner") return 1;
    return a.display_name.localeCompare(b.display_name);
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">
          Travellers ({travellers.length})
        </h2>
      </div>

      {/* Traveller list */}
      <div className="bg-card rounded-lg border border-border divide-y divide-border">
        {sorted.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
              {t.display_name[0]?.toUpperCase()}
            </div>

            {/* Name + role badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-ink truncate">
                  {t.display_name}
                </span>
                {t.role === "planner" && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0">
                    <Crown size={10} />
                    Planner
                  </span>
                )}
              </div>
            </div>

            {/* Remove button — only planner can remove members (not self) */}
            {isPlanner && t.role !== "planner" && (
              <button
                onClick={() => setRemoveConfirmId(t.id)}
                disabled={removing === t.id}
                className="w-10 h-10 flex items-center justify-center text-muted hover:text-money-over transition-colors shrink-0 disabled:opacity-50 -mr-2"
                title="Remove traveller"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Invite section — planner only */}
      {isPlanner && (
        <div className="space-y-2">
          {!inviteUrl ? (
            <button
              onClick={handleGenerateInvite}
              disabled={loadingInvite}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {loadingInvite ? (
                <span className="w-4 h-4 border-2 border-accent-on/40 border-t-accent-on rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {loadingInvite ? "Generating…" : "Invite traveller"}
            </button>
          ) : (
            <div className="bg-card rounded-lg border border-border p-3 space-y-2">
              <p className="text-xs text-muted">
                Share this link — anyone with it can join as a member:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-ground border border-border rounded-md px-3 py-2 text-xs text-ink truncate font-mono">
                  {inviteUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 px-3 py-2 bg-accent text-accent-on text-xs font-medium rounded-md hover:bg-accent-hover transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check size={13} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Link size={13} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info for members */}
      {!isPlanner && (
        <p className="text-xs text-muted text-center py-2">
          You're a member of this trip. Only the planner can invite or remove travellers.
        </p>
      )}

      <ConfirmDialog
        open={!!removeConfirmId}
        title="Remove traveller"
        message={`Are you sure you want to remove ${travellers.find((t) => t.id === removeConfirmId)?.display_name}?`}
        confirmLabel="Remove"
        onConfirm={() => { if (removeConfirmId) return handleRemove(removeConfirmId); }}
        onCancel={() => setRemoveConfirmId(null)}
      />
    </div>
  );
}
