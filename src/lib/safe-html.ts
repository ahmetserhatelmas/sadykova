/** Basit metin → güvenli HTML (satır sonları &lt;br/&gt;) */
export function escapeAndNl2br(raw: string) {
  return raw
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br/>");
}
