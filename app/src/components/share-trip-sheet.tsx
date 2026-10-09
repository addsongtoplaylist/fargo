"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Loader2, Share } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

/**
 * Share trip (v0.5.7): the trip pass image with Share (the phone's share
 * sheet — Instagram story, WhatsApp…), Copy image (paste as a sticker on an
 * Instagram story) and Save image. The image is fetched when the sheet opens
 * so Share and Copy run straight from the tap (phones require that).
 */
export function ShareTripSheet({ tripId, tripName, onClose }: { tripId: string; tripName: string; onClose: () => void }) {
  const { toast } = useToast();
  const [src] = useState(() => `/api/trips/${tripId}/pass?t=${Date.now()}`);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const fileName = `${tripName.replace(/[^\w\- ]+/g, "").trim() || "trip"} - Fargo trip pass.png`;

  useEffect(() => {
    let live = true;
    fetch(src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`${r.status}`))))
      .then((b) => {
        if (!live) return;
        setBlob(b);
        setPreview(URL.createObjectURL(b));
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [src]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const file = blob ? new File([blob], fileName, { type: "image/png" }) : null;
  const canShare = !!file && typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [file] });

  async function handleShare() {
    if (!file) return;
    try {
      await navigator.share({ files: [file] });
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast("Couldn't open sharing. Try Save image instead.", "error");
    }
  }

  async function handleCopy() {
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast("Copied — in Instagram, start a story and paste it", "success");
    } catch {
      toast("This browser can't copy images. Try Share or Save image.", "error");
    }
  }

  function handleSave() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Sheet
      open
      title="Share trip"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2.5">
          {canShare && (
            <Button size="lg" full icon={Share} onClick={handleShare}>
              Share to Instagram story
            </Button>
          )}
          <div className="flex gap-2.5">
            <Button variant="soft" size="lg" icon={Copy} onClick={handleCopy} disabled={!blob} className="flex-1">
              Copy image
            </Button>
            <Button variant="soft" size="lg" icon={Download} onClick={handleSave} disabled={!blob} className="flex-1">
              Save image
            </Button>
          </div>
        </div>
      }
    >
      <div className="rounded-[18px] bg-page p-5 flex items-center justify-center min-h-[300px]">
        {failed ? (
          <p className="text-sm text-fg-muted">Couldn&apos;t make the trip pass. Please try again.</p>
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated PNG (blob URL)
          <img src={preview} alt={`Trip pass for ${tripName}`} className="w-[220px] h-auto shadow-float rounded-[10px]" />
        ) : (
          <Loader2 size={22} className="text-fg-muted animate-spin" aria-label="Making your trip pass" />
        )}
      </div>
      <p className="text-xs text-fg-muted text-center mt-3 leading-relaxed">
        Copy image, then start an Instagram story and paste — it lands as a sticker you can move and resize.
      </p>
    </Sheet>
  );
}
