"use client";

import { useState } from "react";
import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  Link as LinkIcon,
  ListChecks,
  Map as MapIcon,
  Trash2,
  User,
  UserPlus,
  Utensils,
  Wallet,
} from "lucide-react";
import { Card, CardHeader, Eyebrow } from "@/components/ui/card";
import { Button, TextButton } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Segmented } from "@/components/ui/segmented";
import { fieldClass, textareaClass, FieldRow, FieldStack } from "@/components/ui/field";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { Confirm } from "@/components/ui/confirm";
import { ToastCard } from "@/components/ui/toast-card";
import { Empty } from "@/components/ui/empty";
import { Bone } from "@/components/ui/bone";
import { Fab } from "@/components/ui/fab";
import { TabBar } from "@/components/ui/tab-bar";
import { CATEGORY_STYLE, categoryStyle } from "@/lib/category-style";

const COLOURS = [
  ["page", "bg-page"],
  ["surface", "bg-surface border border-line"],
  ["fg", "bg-fg"],
  ["fg-muted", "bg-fg-muted"],
  ["fg-faint", "bg-fg-faint"],
  ["line", "bg-line"],
  ["brand", "bg-brand"],
  ["brand-soft", "bg-brand-soft"],
  ["money-ok", "bg-money-ok"],
  ["money-over", "bg-money-over"],
] as const;

type Split = "equal" | "shares" | "percent" | "amount";

export function UiKit() {
  const [cat, setCat] = useState("food");
  const [split, setSplit] = useState<Split>("shares");
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [tripBar, setTripBar] = useState(true);

  return (
    <div className="min-h-dvh bg-page text-fg pb-44">
      <div className="mx-auto max-w-[var(--max-width-column)] px-4 pt-10 space-y-3">
        <h1 className="text-[30px] font-bold tracking-[-0.5px]">UI kit</h1>
        <p className="text-sm text-fg-muted">Redesign P1 building blocks. Preview-only page.</p>

        <Card>
          <CardHeader title="Colours" />
          <div className="grid grid-cols-5 gap-2 mt-3">
            {COLOURS.map(([name, cls]) => (
              <div key={name} className="text-center">
                <div className={`h-10 rounded-field ${cls}`} />
                <p className="text-[10px] text-fg-muted mt-1">{name}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Type" />
          <p className="text-[30px] font-bold tracking-[-0.5px] mt-2">Screen title 30</p>
          <p className="text-[22px] font-bold">Section header 22</p>
          <p className="text-base font-semibold">Card title 16</p>
          <p className="text-sm">Body 14</p>
          <p className="text-xs text-fg-muted">Label 12 · muted</p>
          <Eyebrow className="mt-2">Eyebrow · fixed</Eyebrow>
          <p className="text-[26px] font-bold tabular-nums mt-2">VND 4,120,000</p>
        </Card>

        <Card>
          <CardHeader title="Buttons" />
          <div className="flex flex-wrap gap-2 mt-3">
            <Button>Primary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="quiet">Quiet</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="danger-outline">Delete trip</Button>
            <Button size="sm" variant="soft">Small</Button>
            <Button icon={UserPlus} variant="quiet" size="sm">Invite</Button>
            <Button disabled>Disabled</Button>
          </div>
          <Button full size="lg" className="mt-3">Full width · large</Button>
          <div className="flex gap-4 mt-2">
            <TextButton tone="danger" icon={Trash2}>Remove</TextButton>
            <TextButton tone="muted">Move to ideas</TextButton>
            <TextButton>Select all</TextButton>
          </div>
        </Card>

        <Card>
          <CardHeader title="Chips" />
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(CATEGORY_STYLE)
              .filter(([k]) => k !== "settlement")
              .map(([key, s]) => (
                <Chip key={key} selected={cat === key} icon={s.icon} iconClassName={s.strong} onClick={() => setCat(key)}>
                  {s.label}
                </Chip>
              ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Chip selected icon={Utensils}>Bites</Chip>
            <Chip disabled trailing={<span className="text-[10px] ml-0.5">Soon</span>}>Shop</Chip>
            <Chip>Halal</Chip>
          </div>
        </Card>

        <Card>
          <CardHeader title="Segmented" />
          <Segmented
            className="mt-3"
            label="Split as"
            value={split}
            onChange={setSplit}
            options={[
              { value: "equal", label: "Equal" },
              { value: "shares", label: "Shares" },
              { value: "percent", label: "%" },
              { value: "amount", label: "Amounts" },
            ]}
          />
        </Card>

        <Card className="space-y-3">
          <CardHeader title="Fields" />
          <FieldRow label="Time" htmlFor="kit-time">
            <input id="kit-time" className={`${fieldClass} w-28`} defaultValue="12:00" />
          </FieldRow>
          <FieldRow label="Paid by" htmlFor="kit-paid">
            <select id="kit-paid" className={fieldClass} defaultValue="me">
              <option value="me">You (Song)</option>
              <option value="ali">Ali</option>
            </select>
          </FieldRow>
          <FieldStack label="Trip name" htmlFor="kit-name" hint="Shown on your trip card.">
            <input id="kit-name" className={fieldClass} placeholder="e.g. Vietnam 2026" />
          </FieldStack>
          <textarea aria-label="Notes" className={`${textareaClass} h-20`} placeholder="Notes (optional)" />
        </Card>

        <Card>
          <CardHeader title="Category icons" />
          <div className="flex flex-wrap gap-2.5 mt-3">
            {Object.keys(CATEGORY_STYLE).map((k) => (
              <div key={k} className="flex flex-col items-center gap-1">
                <CategoryIcon category={k} />
                <span className="text-[10px] text-fg-muted">{categoryStyle(k).label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Avatars" />
          <div className="flex items-center gap-3 mt-3">
            <Avatar name="Song" />
            <Avatar name="Mei" kind="name-only" />
            <Avatar name="Ali" selected />
            <AvatarStack names={["Song", "Ali", "Mei", "Raj", "Jun", "Kai"]} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Overlays" />
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="soft" onClick={() => setSheet(true)}>Open sheet</Button>
            <Button variant="soft" onClick={() => setConfirm(true)}>Open confirm</Button>
            <Button variant="quiet" onClick={() => setTripBar(!tripBar)}>
              {tripBar ? "Show home bar" : "Show trip bar"}
            </Button>
          </div>
        </Card>

        <div className="space-y-2">
          <ToastCard kind="success" message="Trip updated" onDismiss={() => {}} />
          <ToastCard kind="error" message="Failed to save expense. Please try again." onDismiss={() => {}} />
          <ToastCard kind="info" message="Couldn't copy automatically. Copy the link below." onDismiss={() => {}} />
        </div>

        <Card>
          <Empty icon={CalendarDays} message="No activities yet. Tap + to add one." />
        </Card>
        <Card>
          <Empty
            size="page"
            icon={MapIcon}
            title="Where to?"
            message="Create your first trip to start planning your itinerary and tracking your budget."
            action={<Button>New trip</Button>}
          />
        </Card>

        <Card className="space-y-3">
          <CardHeader title="Loading" />
          <Bone className="h-4 w-40" />
          <div className="flex gap-3 items-center">
            <Bone className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-3 w-3/4" />
              <Bone className="h-2.5 w-1/2" />
            </div>
          </div>
        </Card>
      </div>

      <Sheet
        open={sheet}
        title="Edit activity"
        onClose={() => setSheet(false)}
        footer={
          <div className="flex gap-2.5">
            <Button variant="quiet" full onClick={() => setSheet(false)}>Cancel</Button>
            <Button full onClick={() => setSheet(false)}>Save</Button>
          </div>
        }
      >
        <div className="space-y-3 pb-2">
          <input
            aria-label="What's the plan?"
            className="w-full border-b border-line pb-2.5 text-xl font-semibold outline-none bg-transparent"
            defaultValue="Ha Long Bay cruise"
          />
          <FieldRow label="Time" htmlFor="kit-sheet-time">
            <input id="kit-sheet-time" className={`${fieldClass} w-28`} defaultValue="12:00" />
          </FieldRow>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_STYLE)
              .filter(([k]) => k !== "settlement")
              .map(([key, s]) => (
                <Chip key={key} selected={cat === key} icon={s.icon} iconClassName={s.strong} onClick={() => setCat(key)}>
                  {s.label}
                </Chip>
              ))}
          </div>
          <div className="flex justify-between">
            <TextButton tone="muted" icon={LinkIcon}>Move to ideas</TextButton>
            <TextButton tone="danger">Delete</TextButton>
          </div>
        </div>
      </Sheet>

      <Confirm
        open={confirm}
        title="Mark as settled?"
        message="Ali paid you VND 1,219,200. This is added to the payer's expenses and counts in their budget."
        confirmLabel="Mark settled"
        destructive={false}
        onConfirm={() => setConfirm(false)}
        onCancel={() => setConfirm(false)}
      />

      <Fab label="Add activity" onClick={() => setSheet(true)} />
      {tripBar ? (
        <TabBar
          label="Trip sections"
          items={[
            { href: "#overview", label: "Overview", icon: LayoutDashboard, active: false },
            { href: "#schedule", label: "Schedule", icon: CalendarDays, active: true },
            { href: "#money", label: "Money", icon: Wallet, active: false },
            { href: "#prep", label: "Prep", icon: ListChecks, active: false },
            { href: "#discover", label: "Discover", icon: Compass, active: false },
          ]}
        />
      ) : (
        <TabBar
          label="Main"
          items={[
            { href: "#trips", label: "My trips", icon: MapIcon, active: true },
            { href: "#explore", label: "Explore", icon: Compass, active: false },
            { href: "#profile", label: "Profile", icon: User, active: false },
          ]}
        />
      )}
    </div>
  );
}
