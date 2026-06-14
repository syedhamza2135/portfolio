// Thin wrapper over Vercel Web Analytics' global (`window.va`). Cookieless, script-light.
// Using the global avoids pulling the analytics package into the client bundle (§7 JS budget).
type Va = (event: "event", props: { name: string } & Record<string, string | number | boolean>) => void;

export function track(name: string, data?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  const va = (window as unknown as { va?: Va }).va;
  if (typeof va === "function") va("event", { name, ...data });
}
