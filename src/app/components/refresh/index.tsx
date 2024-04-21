"use client";

import { useState } from "react";
import { refresh } from "./server";
import { useRouter } from "next/navigation";

export const RefreshButton = () => {
  const router = useRouter();
  const [buttonLabel, setButtonLabel] = useState("Refresh");
  return (
    <button
      style={{ marginTop: "1rem" }}
      onClick={async () => {
        setButtonLabel("Refreshing...");
        try {
          await refresh();
          router.refresh();
        } catch (err) {
          const error = err as Error;
          alert(`Refresh failed: ${error.name}`);
        }
        setButtonLabel("Refresh");
      }}
    >
      {buttonLabel}
    </button>
  );
};
