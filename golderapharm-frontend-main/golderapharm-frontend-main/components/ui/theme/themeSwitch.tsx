"use client";

import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";

type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  className?: string;
};

//! to enable the button remove the disabled attribute and change "cursor-not-allowed" to "cursor-pointer"

export default function Switch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  className = "",
}: SwitchProps) {
  const [internalChecked, setInternalChecked] =
    useState<boolean>(defaultChecked);
  const checked = controlled ?? internalChecked;

  const toggle = () => {
    const next = !checked;
    if (controlled === undefined) setInternalChecked(next);
    onCheckedChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={onKeyDown}
      disabled
      className={`border-secondary-light relative mt-5 ml-10 inline-flex h-[37px] w-[90px] cursor-not-allowed items-center rounded-full border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
    >
      {/* Track */}
      <span
        className={`absolute inset-0 block rounded-full transition-colors duration-300 ${
          checked ? "bg-[#FFF6E0]" : "bg-slate-900/10"
        }`}
        aria-hidden
      />

      {/* Thumb (moves left/right) */}
      <span
        className={`relative z-10 block size-[37px] transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? "translate-x-[51px]" : "translate-x-0"
        }`}
      >
        {/* inner circle that holds the icon and changes bg */}
        <span
          className={`absolute inset-0 m-0 flex size-[37px] items-center justify-center rounded-full transition-colors duration-300 ${
            checked ? "bg-gold" : "bg-black"
          }`}
        >
          {/* Icons crossfade & scale */}
          <Sun
            size={20}
            className={`text-white transition-all duration-250 ease-in-out ${
              checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          />
          <Moon
            size={20}
            className={`absolute text-white transition-all duration-250 ease-in-out ${
              checked ? "scale-75 opacity-0" : "scale-100 opacity-100"
            }`}
          />
        </span>
      </span>
    </button>
  );
}
