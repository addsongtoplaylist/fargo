"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, UserPlus, X, LogOut, Link as LinkIcon, Check, Loader2, Minus, Plus, Repeat } from "lucide-react";
import {
  getOrCreateInviteCode,
  removeTraveller,
  leaveTrip,
  addTraveller,
  updateTraveller,
  changeOwner,
  unlinkTraveller,
} from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Traveller = {
  id: string;
  display_name: string;
  role: string;
  account_id: string | null; // null = no account yet (D17)
  default_shares?: number | null;
};

type OverviewPeopleProps = {
  tripId: string;
  travellers: Traveller[];
  plannerId: string;
  isPlanner: boolean;
  myAccountId: string;
};

export function OverviewPeople({
  tripId,
  travellers,
  isPlanner,
  myAccountId,
}: OverviewPeopleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [pickingOwner, setPickingOwner] = useState(false);
  const [ownerTarget, setOwnerTarget] = useState<string | null>(null);
  const [unlinkConfirm, setUnlinkConfirm] = useState(false);

  /** Run a traveller action; toast on error, refresh on success. */
  async function run(action: () => Promise<{ error?: string }>, done?: string) {
    if (busy) return false;
    setBusy(true);
    try {
      const result = await action();
      if (result.error) {
        toast(result.error, "error");
        return false;
      }
      if (done) toast(done, "success");
      router.refresh();
      return true;
    } catch {
      toast("Something went wrong. Please try again.", "error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    if (await run(() => addTraveller(tripId, name), `${name} added`)) {
      setNewName("");
      setAdding(false);
    }
  }

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
      toast("Failed to generate invite link.", "error");
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
      const result = await removeTraveller(tripId, travellerId);
      if (result.error) toast(result.error, "error");
      else router.refresh();
    } catch {
      toast("Failed to remove traveller.", "error");
    } finally {
      setRemoving(false);
      setRemoveConfirmId(null);
      setSelectedId(null);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      const result = await leaveTrip(tripId);
      if (result.error) {
        toast(result.error, "error");
        setLeaving(false);
      } else {
        router.push("/trips?noauto=1");
      }
    } catch {
      toast("Failed to leave trip.", "error");
      setLeaving(false);
    }
    setLeaveConfirm(false);
  }

  const selectedTraveller = sorted.find((t) => t.id === selectedId);
  const isSelf = selectedTraveller?.account_id === myAccountId;
  const noAccount = selectedTraveller ? selectedTraveller.account_id === null : false;
  const unclaimed = sorted.filter((t) => t.account_id === null);

  function select(id: string | null) {
    setSelectedId(id);
    setRenameValue(sorted.find((t) => t.id === id)?.display_name ?? "");
    setPickingOwner(false);
  }

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
              onClick={() => select(isSelected ? null : t.id)}
              className={`flex flex-col items-center gap-1 shrink-0 transition-all ${
                isSelected ? "scale-105" : ""
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-accent text-accent-on ring-2 ring-accent ring-offset-2 ring-offset-card"
                    : t.account_id === null
                      ? "bg-card text-muted border border-dashed border-muted/60"
                      : "bg-accent/15 text-accent"
                }`}
                title={t.account_id === null ? `${t.display_name} · no account` : t.display_name}
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

      {/* Quick add traveller — no account needed (planner, D17) */}
      {isPlanner && (
        adding ? (
          <div className="mt-3 flex items-center gap-2">
            <input
              id="new-traveller-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder="Name, e.g. Mum"
              maxLength={60}
              autoFocus
              className="flex-1 min-w-0 bg-ground border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-accent"
            />
            <button
              onClick={handleAdd}
              disabled={busy || !newName.trim()}
              className="px-3 py-2 bg-accent text-accent-on text-sm font-medium rounded-md disabled:opacity-50"
            >
              Add
            </button>
            <button onClick={() => setAdding(false)} aria-label="Cancel" className="p-2 text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-accent border border-dashed border-accent/40 rounded-lg hover:bg-accent-soft transition-colors"
          >
            <Plus size={13} />
            Quick add traveller
          </button>
        )
      )}

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
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div className="flex items-center justify-between gap-2">
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
                {selectedTraveller.role === "planner" ? "Planner" : noAccount ? "No account" : "Member"}
              </span>
            </div>

            {/* Leave trip — member taps their own profile */}
            {isSelf && !isPlanner && (
              <button
                onClick={() => setLeaveConfirm(true)}
                disabled={leaving}
                className="text-xs text-money-over hover:text-money-over/80 transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                <LogOut size={12} />
                Leave trip
              </button>
            )}

            {/* Remove button — planner can remove members (not self) */}
            {isPlanner && selectedTraveller.role !== "planner" && !isSelf && (
              <button
                onClick={() => setRemoveConfirmId(selectedTraveller.id)}
                disabled={removing}
                className="text-xs text-money-over hover:text-money-over/80 transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                <X size={12} />
                Remove
              </button>
            )}
          </div>

          {/* Planner: rename (no-account only, D39) */}
          {isPlanner && noAccount && (
            <div className="flex items-center gap-2">
              <label htmlFor="rename-traveller" className="text-xs text-muted w-14">Name</label>
              <input
                id="rename-traveller"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={60}
                className="flex-1 min-w-0 bg-ground border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
              />
              {renameValue.trim() && renameValue.trim() !== selectedTraveller.display_name && (
                <button
                  onClick={() => run(() => updateTraveller(tripId, selectedTraveller.id, { name: renameValue.trim() }), "Renamed")}
                  disabled={busy}
                  className="px-2.5 py-1.5 bg-accent text-accent-on text-xs font-medium rounded-md disabled:opacity-50"
                >
                  Save
                </button>
              )}
            </div>
          )}

          {/* Planner: default shares (D3) */}
          {isPlanner && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted w-14">Shares</span>
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={() => {
                    const cur = selectedTraveller.default_shares ?? 1;
                    if (cur > 1) run(() => updateTraveller(tripId, selectedTraveller.id, { shares: cur - 1 }));
                  }}
                  disabled={busy || (selectedTraveller.default_shares ?? 1) <= 1}
                  aria-label="Fewer shares"
                  className="px-2 py-1 text-muted hover:text-ink disabled:opacity-40"
                >
                  <Minus size={13} />
                </button>
                <span className="px-2 text-sm text-ink tabular-nums">{selectedTraveller.default_shares ?? 1}</span>
                <button
                  onClick={() => run(() => updateTraveller(tripId, selectedTraveller.id, { shares: (selectedTraveller.default_shares ?? 1) + 1 }))}
                  disabled={busy}
                  aria-label="More shares"
                  className="px-2 py-1 text-muted hover:text-ink disabled:opacity-40"
                >
                  <Plus size={13} />
                </button>
              </div>
              <span className="text-[11px] text-muted">default when splitting by shares</span>
            </div>
          )}

          {/* Planner: turn a member into no-account (D29) */}
          {isPlanner && !noAccount && selectedTraveller.role !== "planner" && !isSelf && (
            <button
              onClick={() => setUnlinkConfirm(true)}
              disabled={busy}
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Turn into no account (keeps their expenses)
            </button>
          )}

          {/* Self: change owner (D40) */}
          {isSelf && selectedTraveller.role !== "planner" && unclaimed.length > 0 && (
            pickingOwner ? (
              <div>
                <p className="text-xs text-muted mb-1.5">Which one are you?</p>
                <div className="border border-border rounded-md divide-y divide-border">
                  {unclaimed.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setOwnerTarget(t.id)}
                      className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-ground"
                    >
                      {t.display_name}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPickingOwner(false)} className="mt-1.5 text-xs text-muted hover:text-ink">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPickingOwner(true)}
                className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
              >
                <Repeat size={12} />
                Change owner — I&apos;m someone else on this list
              </button>
            )
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

      <ConfirmDialog
        open={unlinkConfirm}
        title="Turn into no account"
        message={`${selectedTraveller?.display_name} keeps all their expenses but loses access to this trip. They can claim the name again with the invite link.`}
        confirmLabel="Turn into no account"
        onConfirm={async () => {
          if (selectedTraveller) await run(() => unlinkTraveller(tripId, selectedTraveller.id), "Done");
          setUnlinkConfirm(false);
        }}
        onCancel={() => setUnlinkConfirm(false)}
      />

      <ConfirmDialog
        open={ownerTarget !== null}
        title="Change owner"
        message={`You'll become ${sorted.find((t) => t.id === ownerTarget)?.display_name}, with their expenses. "${selectedTraveller?.display_name}" keeps its expenses and goes back to having no owner.`}
        confirmLabel="Change"
        destructive={false}
        onConfirm={async () => {
          const target = ownerTarget;
          setOwnerTarget(null);
          if (target && (await run(() => changeOwner(tripId, target), "Owner changed"))) select(null);
        }}
        onCancel={() => setOwnerTarget(null)}
      />

      <ConfirmDialog
        open={leaveConfirm}
        title="Leave trip"
        message="Are you sure you want to leave this trip? You'll lose access to all shared activities, expenses, and checklists."
        confirmLabel="Leave"
        onConfirm={handleLeave}
        onCancel={() => setLeaveConfirm(false)}
      />
    </div>
  );
}
