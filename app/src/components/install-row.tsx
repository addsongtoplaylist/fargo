"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { ProfileRow, ROW_DIVIDER } from "@/components/profile-row";
import { canInstall, openInstallPrompt } from "@/components/install-prompt";

/**
 * Profile row that opens the "Add Fargo to your phone" sheet (v0.6.10).
 * Only on a phone browser where Fargo isn't installed; renders nothing in the
 * installed app or on a computer. Includes the divider below it.
 */
export function InstallRow() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- device check needs the browser
    setShow(canInstall());
  }, []);
  if (!show) return null;
  return (
    <>
      <button type="button" onClick={openInstallPrompt} className="w-full text-left">
        <ProfileRow icon={Smartphone} label="Add Fargo to your Home Screen" chevron />
      </button>
      <div className={ROW_DIVIDER} />
    </>
  );
}
