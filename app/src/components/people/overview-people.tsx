"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, UserPlus, LogOut, Link as LinkIcon, Check, Loader2, Repeat, Trash2 } from "lucide-react";
import {
  getOrCreateInviteCode,
  removeTraveller,
  leaveTrip,
  addTraveller,
  updateTraveller,
  changeOwner,
} from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button, TextButton } from "@/components/ui/button";
import { fieldClass, FieldRow } from "@/components/ui/field";

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

/**
 * Travellers card (redesign P4). Two panels, never both open:
 * - Invite (planner): Quick add traveller + Share this link
 * - Tap a person: name · badge · Remove, rename (name-only) — shares live in
 *   Money → Split shares (P6),
 *   and for yourself (member): Leave trip / Change owner.
 * Actions and rules are unchanged from before the redesign.
 */
export function OverviewPeople({ tripId, travellers, isPlanner, myAccountId }: OverviewPeopleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [pickingOwner, setPickingOwner] = useState(false);
  const [ownerTarget, setOwnerTarget] = useState<string | null>(null);

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
    }
  }

  // Sort: planner first, then alphabetical
  const sorted = [...travellers].sort((a, b) => {
    if (a.role === "planner") return -1;
    if (b.role === "planner") return 1;
    return a.display_name.localeCompare(b.display_name);
  });

  async function loadInvite() {
    setLoadingInvite(true);
    try {
      const code = await getOrCreateInviteCode(tripId);
      setInviteUrl(`${window.location.origin}/invite/${code}`);
    } catch {
      toast("Failed to generate invite link.", "error");
    } finally {
      setLoadingInvite(false);
    }
  }

  function toggleInvite() {
    const next = !inviteOpen;
    setInviteOpen(next);
    if (next) {
      select(null);
      if (!inviteUrl && !loadingInvite) loadInvite();
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
    if (id) setInviteOpen(false);
  }

  const badge = (t: Traveller) =>
    t.role === "planner" ? (
      <span className="text-[10px] font-bold tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-md bg-[#fdf3dc] text-[#8a5a0b]">
        Planner
      </span>
    ) : (
      <span className="text-[10px] font-bold tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-md bg-page text-fg-muted">
        {t.account_id === null ? "No account" : "Member"}
      </span>
    );

  return (
    <div className="bg-surface rounded-card p-4">
      {/* Header: title + Invite (planner) */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-fg">
          Travellers <span className="text-fg-muted font-medium">{travellers.length}</span>
        </h2>
        {isPlanner && (
          <Button variant={inviteOpen ? "soft" : "quiet"} size="sm" icon={UserPlus} onClick={toggleInvite} aria-expanded={inviteOpen}>
            Invite
          </Button>
        )}
      </div>

      {/* Avatars — scroll sideways when more than 6 */}
      <div className={`flex gap-2 mt-3.5 ${sorted.length > 6 ? "overflow-x-auto scrollbar-none pb-1" : "flex-wrap"}`} data-swipe-ignore>
        {sorted.map((t) => {
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => select(isSelected ? null : t.id)}
              aria-pressed={isSelected}
              aria-label={`${t.display_name}${t.role === "planner" ? ", planner" : t.account_id === null ? ", no account" : ""}`}
              className="flex flex-col items-center gap-1 w-[52px] shrink-0"
            >
              <Avatar name={t.display_name} kind={t.account_id === null ? "name-only" : "account"} selected={isSelected} />
              <span className="text-[11px] text-fg-muted max-w-[52px] truncate">{t.display_name.split(" ")[0]}</span>
              {t.role === "planner" ? <Crown size={11} className="text-[#b7791f] -mt-0.5" aria-hidden /> : <span className="h-[11px]" />}
            </button>
          );
        })}
      </div>

      {/* Invite panel (planner): Quick add + Share this link */}
      {isPlanner && inviteOpen && (
        <div className="border-t border-line mt-3.5 pt-3.5 space-y-4">
          <div>
            <p className="text-[13px] font-semibold text-fg mb-2">Quick add traveller</p>
            <div className="flex gap-2">
              <input
                id="new-traveller-name"
                aria-label="New traveller name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
                placeholder="Name, e.g. Mum"
                maxLength={60}
                className={`${fieldClass} flex-1 min-w-0`}
              />
              <Button onClick={handleAdd} disabled={busy || !newName.trim()}>
                Add
              </Button>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-fg mb-2">Share this link</p>
            <div className="flex gap-2 items-center">
              <div className="flex-1 min-w-0 bg-page border border-line rounded-field px-3 h-11 flex items-center text-xs text-fg font-mono truncate">
                {loadingInvite ? (
                  <span className="flex items-center gap-1.5 text-fg-muted font-sans">
                    <Loader2 size={14} className="animate-spin" aria-hidden /> Generating…
                  </span>
                ) : (
                  <span className="truncate">{inviteUrl ?? "—"}</span>
                )}
              </div>
              <Button onClick={handleCopyLink} disabled={!inviteUrl} icon={copied ? Check : LinkIcon}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tap-a-person panel */}
      {selectedTraveller && (
        <div className="border-t border-line mt-3.5 pt-3.5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[15px] font-semibold text-fg truncate">{selectedTraveller.display_name}</span>
              {badge(selectedTraveller)}
            </div>

            {/* Leave trip — member taps their own profile */}
            {isSelf && !isPlanner && (
              <TextButton tone="danger" icon={LogOut} onClick={() => setLeaveConfirm(true)} disabled={leaving}>
                Leave trip
              </TextButton>
            )}

            {/* Remove — planner can remove others (not self); blocked by the server if they have expenses */}
            {isPlanner && selectedTraveller.role !== "planner" && !isSelf && (
              <TextButton tone="danger" icon={Trash2} onClick={() => setRemoveConfirmId(selectedTraveller.id)} disabled={removing}>
                Remove
              </TextButton>
            )}
          </div>

          {/* Planner: rename (no-account only, D39) */}
          {isPlanner && noAccount && (
            <FieldRow label="Name" htmlFor="rename-traveller">
              <input
                id="rename-traveller"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={60}
                className={`${fieldClass} flex-1 min-w-0`}
              />
              <Button
                variant="soft"
                onClick={() => run(() => updateTraveller(tripId, selectedTraveller.id, { name: renameValue.trim() }), "Renamed")}
                disabled={busy || !renameValue.trim() || renameValue.trim() === selectedTraveller.display_name}
              >
                Save
              </Button>
            </FieldRow>
          )}

          {/* Self: change owner (D40) */}
          {isSelf && selectedTraveller.role !== "planner" && unclaimed.length > 0 && (
            pickingOwner ? (
              <div>
                <p className="text-xs text-fg-muted mb-1.5">Which one are you?</p>
                <div className="border border-line rounded-field divide-y divide-line overflow-hidden">
                  {unclaimed.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setOwnerTarget(t.id)}
                      className="w-full text-left px-3 py-2.5 text-sm text-fg hover:bg-page"
                    >
                      {t.display_name}
                    </button>
                  ))}
                </div>
                <TextButton tone="muted" onClick={() => setPickingOwner(false)}>
                  Cancel
                </TextButton>
              </div>
            ) : (
              <TextButton icon={Repeat} onClick={() => setPickingOwner(true)}>
                Change owner — I&apos;m someone else on this list
              </TextButton>
            )
          )}
        </div>
      )}

      {/* Info for members */}
      {!isPlanner && (
        <p className="text-xs text-fg-muted text-center mt-3.5">Only the planner can invite or remove travellers.</p>
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
