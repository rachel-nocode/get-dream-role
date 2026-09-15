/**
 * Stable short ids for master-profile entries (`exp_1`, `b_1_2`, `sk_3`).
 *
 * Tailoring cites these ids as evidence, so they are assigned in code rather
 * than by a model: the same registry always produces the same ids, and an id
 * the user already has is kept when they edit a section.
 */

function existingId(entry: object): string {
  const value = (entry as { id?: unknown }).id;
  return typeof value === "string" ? value.trim() : "";
}

function uniqueId(desired: string, prefix: string, used: Set<string>): string {
  if (desired.length > 0 && !used.has(desired)) return desired;

  let counter = used.size + 1;
  let candidate = `${prefix}_${counter}`;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `${prefix}_${counter}`;
  }
  return candidate;
}

/**
 * Keeps ids that are already set and mints `prefix_n` for the rest.
 * Pass `used` to keep ids unique across several calls, as bullets need.
 */
export function withEntryIds<T extends object>(
  entries: readonly T[],
  prefix: string,
  used: Set<string> = new Set<string>(),
): Array<T & { id: string }> {
  return entries.map((entry, index) => {
    const id = uniqueId(existingId(entry) || `${prefix}_${index + 1}`, prefix, used);
    used.add(id);
    return { ...entry, id };
  });
}

/** Bullet ids carry their experience position: `b_<experience>_<bullet>`. */
export function withBulletIds<T extends object>(
  bullets: readonly T[],
  experienceIndex: number,
  used: Set<string> = new Set<string>(),
): Array<T & { id: string }> {
  return withEntryIds(bullets, `b_${experienceIndex + 1}`, used);
}
