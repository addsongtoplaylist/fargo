"use client";

import { useState, useRef } from "react";
import { MoreHorizontal, Check, Trash2, Pencil, ListChecks, Plus, X } from "lucide-react";
import {
  createChecklist,
  renameChecklist,
  deleteChecklist,
  addChecklistItem,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from "@/lib/actions/checklist";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import type { Checklist } from "@/lib/actions/checklist";
import { Empty } from "@/components/ui/empty";
import { Button, TextButton } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";

type ChecklistSectionProps = {
  checklists: Checklist[];
  tripId: string;
  isPlanner?: boolean;
};

export function ChecklistSection({ checklists, tripId, isPlanner = true }: ChecklistSectionProps) {
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const newListRef = useRef<HTMLInputElement>(null);
  const creatingRef = useRef(false);
  const { toast } = useToast();

  async function handleCreateList() {
    if (!newListName.trim() || creatingRef.current) return;
    creatingRef.current = true;
    try {
      await createChecklist(tripId, newListName.trim());
      setNewListName("");
      setCreatingList(false);
    } catch (err) {
      console.error(err);
      toast("Failed to create checklist. Please try again.", "error");
    } finally {
      creatingRef.current = false;
    }
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-baseline justify-between px-1 mb-2">
        <h2 className="text-base font-semibold text-fg">Checklists</h2>
        {isPlanner && (
          <TextButton
            icon={Plus}
            onClick={() => {
              setCreatingList(true);
              setTimeout(() => newListRef.current?.focus(), 100);
            }}
            className="py-0"
          >
            New list
          </TextButton>
        )}
      </div>

      {/* New list input */}
      {creatingList && (
        <div className="bg-surface rounded-card p-4 mb-3">
          <input
            ref={newListRef}
            type="text"
            placeholder="List name"
            aria-label="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className={fieldClass}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newListName.trim()) handleCreateList();
              if (e.key === "Escape") setCreatingList(false);
            }}
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="quiet" size="sm" onClick={() => setCreatingList(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateList} disabled={!newListName.trim()}>
              Create
            </Button>
          </div>
        </div>
      )}

      {/* Checklist cards */}
      <div className="space-y-3">
        {checklists.map((list) => (
          <ChecklistCard key={list.id} checklist={list} tripId={tripId} isPlanner={isPlanner} />
        ))}

        {checklists.length === 0 && !creatingList && (
          <div className="bg-surface rounded-card">
            <Empty icon={ListChecks} message="No checklists yet. Create one to start packing." />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Single checklist card ──────────────────────────

function ChecklistCard({
  checklist,
  tripId,
  isPlanner = true,
}: {
  checklist: Checklist;
  tripId: string;
  isPlanner?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(checklist.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemText, setEditItemText] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);
  const addItemRef = useRef<HTMLInputElement>(null);
  const addingRef = useRef(false);
  const { toast } = useToast();

  // Optimistic tick state while a toggle is in flight
  const [pendingDone, setPendingDone] = useState<Record<string, boolean>>({});
  const isDone = (item: { id: string; done: boolean }) => pendingDone[item.id] ?? item.done;

  const items = checklist.checklist_items ?? [];
  const doneCount = items.filter(isDone).length;

  /** Run a server action; toast on failure. Returns true on success. */
  async function run(action: () => Promise<unknown>, failMsg: string) {
    try {
      await action();
      return true;
    } catch (err) {
      console.error(err);
      toast(failMsg, "error");
      return false;
    }
  }

  async function handleRename() {
    if (!renameName.trim() || renameName.trim() === checklist.name) {
      setRenaming(false);
      return;
    }
    const ok = await run(
      () => renameChecklist(checklist.id, tripId, renameName.trim()),
      "Failed to rename checklist. Please try again."
    );
    if (!ok) setRenameName(checklist.name);
    setRenaming(false);
    setMenuOpen(false);
  }

  async function handleDeleteList() {
    await run(
      () => deleteChecklist(checklist.id, tripId),
      "Failed to delete checklist. Please try again."
    );
  }

  async function handleAddItem() {
    if (!newItemText.trim() || addingRef.current) return;
    addingRef.current = true;
    const ok = await run(
      () => addChecklistItem(checklist.id, tripId, newItemText.trim()),
      "Failed to add item. Please try again."
    );
    addingRef.current = false;
    if (!ok) return;
    setNewItemText("");
    // Keep focus on the input for rapid entry
    setTimeout(() => addItemRef.current?.focus(), 50);
  }

  async function handleToggle(itemId: string, currentDone: boolean) {
    setPendingDone((p) => ({ ...p, [itemId]: !currentDone }));
    await run(
      () => toggleChecklistItem(itemId, tripId, !currentDone),
      "Failed to update item. Please try again."
    );
    setPendingDone((p) => {
      const next = { ...p };
      delete next[itemId];
      return next;
    });
  }

  function startEditingItem(item: { id: string; text: string }) {
    setEditingItemId(item.id);
    setEditItemText(item.text);
  }

  async function handleEditItemSave(itemId: string) {
    const original = items.find((i) => i.id === itemId);
    if (!editItemText.trim() || editItemText.trim() === original?.text) {
      setEditingItemId(null);
      return;
    }
    await run(
      () => updateChecklistItem(itemId, tripId, editItemText.trim()),
      "Failed to save item. Please try again."
    );
    setEditingItemId(null);
  }

  async function handleDeleteItem(itemId: string) {
    await run(
      () => deleteChecklistItem(itemId, tripId),
      "Failed to delete item. Please try again."
    );
  }

  return (
    <div className="bg-surface rounded-card">
      {/* List header */}
      <div className="flex items-center justify-between gap-2 pl-4 pr-2 pt-3 pb-2">
        <div className="flex items-baseline gap-2 flex-1 min-w-0">
          {renaming ? (
            <input
              ref={renameRef}
              type="text"
              aria-label="List name"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              className={`${fieldClass} h-9`}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              onBlur={handleRename}
              autoFocus
            />
          ) : (
            <>
              <span className="text-[15px] font-semibold text-fg truncate">{checklist.name}</span>
              {items.length > 0 && (
                <span className="text-[13px] text-fg-muted shrink-0 tabular-nums">
                  {doneCount} of {items.length}
                </span>
              )}
            </>
          )}
        </div>

        {/* ••• menu — planner only */}
        {isPlanner && (
          <div className="relative">
            <button
              aria-label="List options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-fg-muted hover:bg-page hover:text-fg transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 z-50 bg-surface rounded-field shadow-float py-1.5 min-w-[160px]">
                  <button
                    onClick={() => {
                      setRenaming(true);
                      setMenuOpen(false);
                      setTimeout(() => renameRef.current?.focus(), 50);
                    }}
                    className="w-full px-3.5 h-10 text-left text-sm text-fg hover:bg-page flex items-center gap-2.5"
                  >
                    <Pencil size={15} />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDelete(true);
                    }}
                    className="w-full px-3.5 h-10 text-left text-sm text-money-over hover:bg-page flex items-center gap-2.5"
                  >
                    <Trash2 size={15} />
                    Delete list
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-line border-t border-line">
        {items.map((item) => {
          const done = isDone(item);
          return (
            <div key={item.id} className="flex items-center gap-3 pl-4 pr-2 min-h-[46px] group">
              {/* Tick — everyone can tick (P2) */}
              <button
                onClick={() => handleToggle(item.id, done)}
                role="checkbox"
                aria-checked={done}
                aria-label={item.text}
                className={`w-[22px] h-[22px] rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  done ? "bg-brand border-brand text-brand-on" : "border-line hover:border-brand"
                }`}
              >
                {done && <Check size={13} strokeWidth={3} />}
              </button>

              {/* Text — planner taps to edit */}
              {editingItemId === item.id ? (
                <input
                  type="text"
                  aria-label="Item"
                  value={editItemText}
                  onChange={(e) => setEditItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditItemSave(item.id);
                    if (e.key === "Escape") setEditingItemId(null);
                  }}
                  onBlur={() => handleEditItemSave(item.id)}
                  className="flex-1 text-sm text-fg bg-transparent outline-none border-b border-brand py-1"
                  autoFocus
                />
              ) : (
                <span
                  className={`flex-1 text-sm py-2.5 ${isPlanner ? "cursor-text" : ""} ${
                    done ? "line-through text-fg-faint" : "text-fg"
                  }`}
                  onClick={() => isPlanner && startEditingItem(item)}
                >
                  {item.text}
                </span>
              )}

              {/* Delete — always visible on touch, hover-reveal on desktop */}
              {isPlanner && (
                <button
                  aria-label={`Delete ${item.text}`}
                  onClick={() => handleDeleteItem(item.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-fg-faint hover:text-money-over transition-colors sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline add item — planner only */}
      {isPlanner && (
        <div className={`flex items-center gap-3 px-4 min-h-[46px] ${items.length > 0 ? "border-t border-line" : ""}`}>
          <Plus size={18} className="text-fg-faint shrink-0" aria-hidden />
          <input
            ref={addItemRef}
            type="text"
            placeholder="Add item"
            aria-label="Add item"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="flex-1 bg-transparent text-sm text-fg placeholder:text-fg-faint outline-none py-2.5"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newItemText.trim()) handleAddItem();
            }}
          />
        </div>
      )}
      {!isPlanner && items.length === 0 && <p className="px-4 py-3 text-sm text-fg-muted border-t border-line">No items yet.</p>}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete checklist"
        message={`Are you sure you want to delete "${checklist.name}" and all its items?`}
        onConfirm={handleDeleteList}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
