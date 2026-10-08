"use client";

import { useRef, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { coverObjectPosition } from "@/lib/cover";

/**
 * Reposition the cover photo (v0.5.5): drag the photo up or down inside a
 * frame shaped like the Overview header (or use the slider). The same
 * position is used on My trips cards, the share page and the invite card.
 */
export function CoverRepositionSheet({
  url,
  initialPosition,
  saving,
  onSave,
  onClose,
}: {
  url: string;
  initialPosition: number;
  saving: boolean;
  onSave: (position: number) => void;
  onClose: () => void;
}) {
  const [position, setPosition] = useState(initialPosition);
  const [movable, setMovable] = useState(true);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ y: number; position: number } | null>(null);

  /** How many pixels of photo are hidden above + below the frame. */
  function hiddenHeight() {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img || !img.naturalWidth) return 0;
    const shown = frame.clientWidth * (img.naturalHeight / img.naturalWidth);
    return Math.max(0, shown - frame.clientHeight);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, position };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const hidden = hiddenHeight();
    if (hidden <= 0) return;
    // Dragging the photo down shows more of its top (a smaller position)
    const next = drag.current.position - ((e.clientY - drag.current.y) / hidden) * 100;
    setPosition(Math.round(Math.min(100, Math.max(0, next))));
  }

  function onPointerUp() {
    drag.current = null;
  }

  const objectPosition = coverObjectPosition(position);

  return (
    <Sheet
      open
      title="Reposition cover"
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <Button variant="quiet" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onSave(position)} disabled={saving || position === initialPosition} className="flex-1">
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-fg-muted mb-3">
        {movable ? "Drag the photo up or down to choose what shows." : "This photo already fits the frame — there's nothing to move."}
      </p>

      {/* Same shape as the Overview header */}
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative h-[190px] rounded-[22px] overflow-hidden bg-skeleton select-none touch-none ${
          movable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Supabase storage photo; already resized on upload */}
        <img
          ref={imgRef}
          src={url}
          alt="Cover photo"
          draggable={false}
          onLoad={() => setMovable(hiddenHeight() > 0)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {movable && (
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Photo position, top to bottom"
          className="w-full mt-4 accent-brand"
        />
      )}

      {/* How it looks on My trips */}
      <div className="flex items-center gap-3 mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- same photo as above */}
        <img
          src={url}
          alt=""
          aria-hidden
          className="w-[52px] h-[52px] rounded-[12px] object-cover shrink-0"
          style={{ objectPosition }}
        />
        <p className="text-xs text-fg-muted">Also used on My trips, the share link and invites.</p>
      </div>
    </Sheet>
  );
}
