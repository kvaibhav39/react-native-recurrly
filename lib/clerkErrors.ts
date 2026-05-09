/** Merge form + Clerk field errors and drop duplicate lines (same text twice). */
export function uniqueAuthMessages(
  parts: (string | null | undefined)[],
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    const s = typeof p === "string" ? p.trim() : "";
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export function getClerkCallError(result: unknown): string | null {
  if (!result || typeof result !== "object" || !("error" in result)) {
    return null;
  }
  const err = (result as { error: unknown }).error;
  if (err == null) return null;
  const e = err as {
    errors?: Array<{ longMessage?: string; message?: string }>;
    message?: string;
  };
  return (
    e.errors?.[0]?.longMessage ??
    e.errors?.[0]?.message ??
    e.message ??
    null
  );
}
