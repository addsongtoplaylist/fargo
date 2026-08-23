"use client";

import { useState, useRef } from "react";
import {
  MoreHorizontal,
  Check,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  createChecklist,
  renameChecklist,
  deleteChecklist,
  addChecklistItem,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from "@/lib/actions/checklist";
import type { Checklist } from "@/lib/actions/checklist";

type ChecklistSectionProps = {
  checklists: Checklist[];
  tripId: string;
};

export function ChecklistSection({ checklists, tripId }: ChecklistSectionProps) {
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const newListRef = useRef<HTMLInputElement>(null);

  async function handleCreateList() {
    if (!newListName.trim()) return;
    await createChecklist(tripId, newListName.trim());
    setNewListName("");
    setCreatingList(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-ink">Checklists</h3>
        <button
          onClick={() => {
            setCreatingList(true);
            setTimeout(() => newListRef.current?.focus(), 100);
          }}
          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          + New list
        </button>
      </div>

      {/* New list input */}
      {creatingList && (
        <div className="bg-card rounded-lg border border-accent/40 px-3 py-2.5 mb-2">
          <input
            ref={newListRef}
            type="text"
            placeholder="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-muted/50 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newListName.trim()) handleCreateList();
              if (e.key === "Escape") setCreatingList(false);
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setCreatingList(false)}
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateList}
              disabled={!newListName.trim()}
              className="px-3 py-1 bg-accent text-accent-on text-xs font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Checklist cards */}
      <div className="space-y-3">
        {checklists.map((list) => (
          <ChecklistCard key={list.id} checklist={list} tripId={tripId} />
        ))}

        {checklists.length === 0 && !creatingList && (
          <p className="text-sm text-muted py-4 text-center">
            No checklists yet. Create one to start packing.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Single checklist card ──────────────────────────

function ChecklistCard({
  checklist,
  tripId,
}: {
  checklist: Checklist;
  tripId: string;
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

  const items = checklist.checklist_items ?? [];
  const doneCount = items.filter((i) => i.done).length;

  async function handleRename() {
    if (!renameName.trim() || renameName.trim() === checklist.name) {
      setRenaming(false);
      return;
    }
    await renameChecklist(checklist.id, tripId, renameName.trim());
    setRenaming(false);
    setMenuOpen(false);
  }

  async function handleDeleteList() {
    await deleteChecklist(checklist.id, tripId);
  }

  async function handleAddItem() {
    if (!newItemText.trim()) return;
    await addChecklistItem(checklist.id, tripId, newItemText.trim());
    setNewItemText("");
    // Keep focus on the input for rapid entry
    setTimeout(() => addItemRef.current?.focus(), 50);
  }

  async function handleToggle(itemId: string, currentDone: boolean) {
    await toggleChecklistItem(itemId, tripId, !currentDone);
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
    await updateChecklistItem(itemId, tripId, editItemText.trim());
    setEditingItemId(null);
  }

  async function handleDeleteItem(itemId: string) {
    await deleteChecklistItem(itemId, tripId);
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* List header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {renaming ? (
            <input
              ref={renameRef}
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              className="text-sm font-medium text-ink bg-transparent outline-none flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              onBlur={handleRename}
              autoFocus
            />
          ) : (
            <>
              <span className="text-sm font-medium text-ink truncate">
                {checklist.name}
              </span>
              {items.length > 0 && (
                <span className="text-xs text-muted shrink-0">
                  {doneCount} of {items.length}
                </span>
              )}
            </>
          )}
        </div>

        {/* ••• menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-muted hover:text-ink transition-colors p-0.5"
          >
            <MoreHorizontal size={16} />
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
              <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-sm py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    setRenaming(true);
                    setMenuOpen(false);
                    setTimeout(() => renameRef.current?.focus(), 50);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-ground flex items-center gap-2"
                >
                  <Pencil size={13} />
                  Rename
                </button>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full px-3 py-1.5 text-left text-sm text-money-over hover:bg-ground flex items-center gap-2"
                  >
                    <Trash2 size={13} />
                    Delete list
                  </button>
                ) : (
                  <button
                    onClick={handleDeleteList}
                    className="w-full px-3 py-1.5 text-left text-sm text-money-over hover:bg-money-over-soft flex items-center gap-2"
                  >
                    <Trash2 size={13} />
                    Delete &ldquo;{checklist.name}&rdquo;?
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Items */}
      <div>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-b-0 group"
          >
            {/* Checkbox */}
            <button
              onClick={() => handleToggle(item.id, item.done)}
              className={`
                w-[18px] h-[18px] rounded border-2 shrink-0 flex items-center justify-center transition-colors
                ${
                  item.done
                    ? "bg-accent border-accent text-accent-on"
                    : "border-border hover:border-accent"
                }
              `}
            >
              {item.done && <Check size={12} strokeWidth={3} />}
            </button>

            {/* Text — tap to edit */}
            {editingItemId === item.id ? (
              <input
                type="text"
                value={editItemText}
                onChange={(e) => setEditItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditItemSave(item.id);
                  if (e.key === "Escape") setEditingItemId(null);
                }}
                onBlur={() => handleEditItemSave(item.id)}
                className="flex-1 text-sm text-ink bg-transparent outline-none border-b border-accent"
                autoFocus
              />
            ) : (
              <span
                className={`flex-1 text-sm cursor-text ${
                  item.done ? "line-through text-muted" : "text-ink"
                }`}
                onClick={() => startEditingItem(item)}
              >
                {item.text}
              </span>
            )}

            {/* Delete — visible on hover / always on touch */}
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="text-muted hover:text-money-over transition-colors opacity-0 group-hover:opacity-100 p-0.5"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Inline add item */}
      <div className="px-3 py-2">
        <input
          ref={addItemRef}
          type="text"
          placeholder="+ Add item…"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="w-full bg-transparent text-sm text-ink placeholder:text-muted/50 outline-none border-b border-dashed border-border focus:border-accent transition-colors pb-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && newItemText.trim()) handleAddItem();
          }}
        />
      </div>
    </div>
  );
}
