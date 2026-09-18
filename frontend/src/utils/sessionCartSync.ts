export type SessionCartAction = "none" | "refresh" | "reset";

export function getSessionCartAction(
  hasHydrated: boolean,
  isLoggedIn: boolean,
  hasSyncedCart: boolean,
): SessionCartAction {
  if (!hasHydrated) return "none";
  if (!isLoggedIn) return "reset";
  return hasSyncedCart ? "none" : "refresh";
}
