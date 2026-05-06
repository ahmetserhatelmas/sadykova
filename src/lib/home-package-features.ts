/** `home_packages.features` JSONB → string list */
export function parseHomePackageFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  return [];
}
