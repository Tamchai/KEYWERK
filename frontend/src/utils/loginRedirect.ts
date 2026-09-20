export function resolveLoginDestination(requestedPath: string | undefined, isAdmin: boolean): string {
  const fallback = isAdmin ? "/admin" : "/profile";
  if (!requestedPath?.startsWith("/") || requestedPath.startsWith("//")) return fallback;
  if (!isAdmin && (requestedPath === "/admin" || requestedPath.startsWith("/admin/") || requestedPath.startsWith("/admin?"))) return fallback;
  return requestedPath;
}
