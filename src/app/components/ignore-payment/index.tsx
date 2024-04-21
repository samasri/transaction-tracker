"use client";

import { useState } from "react";
import { ignorePayment, refresh } from "./server";
import { useRouter } from "next/navigation";

interface Props {
  bankName: string;
  paymentId: string;
}

export const Ignorebutton = ({ paymentId, bankName }: Props) => {
  const router = useRouter();
  const [buttonLabel, setButtonLabel] = useState("Ignore");
  return (
    <button
      onClick={async () => {
        setButtonLabel("ignoring...");
        await ignorePayment(paymentId, bankName);
        await refresh();
        setButtonLabel("Ignore");
        router.refresh();
      }}
    >
      {buttonLabel}
    </button>
  );
};
