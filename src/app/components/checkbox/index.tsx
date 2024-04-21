"use client";

import { useState } from "react";
import { saveSw } from "./server";

export const Checkbox = ({ id, isSplit }: { id: string; isSplit: boolean }) => {
  const [split, setSplit] = useState(isSplit);
  return (
    <input
      type="checkbox"
      onChange={() => {
        try {
          saveSw(id, !split);
          setSplit(!split);
        } catch (err) {
          const error = err as Error;
          alert(`Error saving split info: ${error.name}`);
        }
      }}
      checked={split}
    ></input>
  );
};
