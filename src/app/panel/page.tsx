import { redirect } from "next/navigation";

export default async function PanelIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ onay?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = sp.onay;
  const onay = Array.isArray(raw) ? raw[0] : raw;
  const q = onay === "eposta" ? "?onay=eposta" : "";
  redirect(`/panel/programlar${q}`);
}
