import React from "react";
import { useVoiceInput } from "../utils/useVoiceInput.js";

// Small mic button you place next to any text field.
// onText receives the spoken text so the parent can fill it into the field.
export default function MicButton({ onText, className = "" }) {
  const { listening, start } = useVoiceInput(onText);

  return (
    <button
      type="button"
      onClick={start}
      title="Tap and speak"
      className={
        "flex items-center justify-center rounded-full w-8 h-8 shrink-0 " +
        (listening
          ? "bg-ksorange text-white mic-pulse"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200") +
        " " + className
      }
    >
      {listening ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
          <path d="M19 11a1 1 0 00-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7 7 0 006 6.93V20H9a1 1 0 000 2h6a1 1 0 000-2h-2v-2.07A7 7 0 0019 11z" />
        </svg>
      )}
    </button>
  );
}
