import type { FormEvent } from "react";

// Opens the SeeVia AI widget with the visitor's question already typed in.
export function askAssistant(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const field = event.currentTarget.elements.namedItem("question");
  const text = field instanceof HTMLInputElement ? field.value.trim() : "";
  window.dispatchEvent(
    new CustomEvent("seevia:open-assistant", { detail: { text } }),
  );
}
