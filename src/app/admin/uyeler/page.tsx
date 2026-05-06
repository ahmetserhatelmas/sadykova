"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatTier } from "@/lib/membership";
import type { MembershipTier } from "@/types/db";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  membership_tier: MembershipTier | null;
};

type ProgramRow = { id: string; title: string };

export default function AdminUyelerPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [accessByUser, setAccessByUser] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { data: profs, error: pErr } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,membership_tier")
      .order("created_at", { ascending: false });
    if (pErr) {
      setErr(pErr.message);
      setLoading(false);
      return;
    }
    const { data: progs, error: gErr } = await supabase
      .from("programs")
      .select("id,title")
      .order("sort_order");
    if (gErr) {
      setErr(gErr.message);
      setLoading(false);
      return;
    }
    const { data: accessRows, error: aErr } = await supabase
      .from("user_program_access")
      .select("user_id, program_id");
    if (aErr) {
      setErr(aErr.message);
      setLoading(false);
      return;
    }
    const map: Record<string, string[]> = {};
    for (const row of accessRows ?? []) {
      if (!map[row.user_id]) map[row.user_id] = [];
      map[row.user_id].push(row.program_id);
    }
    setProfiles(profs ?? []);
    setPrograms(progs ?? []);
    setAccessByUser(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveTier(userId: string, tier: MembershipTier | "") {
    const supabase = createClient();
    setSavingUser(userId);
    const { error } = await supabase
      .from("profiles")
      .update({
        membership_tier: tier === "" ? null : tier,
      })
      .eq("id", userId);
    setSavingUser(null);
    if (error) setErr(error.message);
    else void load();
  }

  async function toggleProgram(userId: string, programId: string, checked: boolean) {
    const supabase = createClient();
    setSavingUser(userId);
    if (checked) {
      const { error } = await supabase.from("user_program_access").insert({
        user_id: userId,
        program_id: programId,
      });
      if (error) setErr(error.message);
    } else {
      const { error } = await supabase
        .from("user_program_access")
        .delete()
        .eq("user_id", userId)
        .eq("program_id", programId);
      if (error) setErr(error.message);
    }
    setSavingUser(null);
    void load();
  }

  const users = profiles.filter((p) => p.role === "user");

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight">
        Üyeler ve erişim
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Üyelik paketi (1 / 2 / 3), ev paketiyle aynı seviyedeki programlara{" "}
        <span className="font-semibold text-black">otomatik erişim</span> verir.
        Aşağıdaki kutularla ek olarak tek tek program da açabilir veya paket
        dışı içerik paylaşabilirsiniz.
      </p>
      {err ? <p className="mt-4 text-sm text-red-600">{err}</p> : null}
      {loading ? (
        <p className="mt-8 text-sm text-zinc-500">Yükleniyor…</p>
      ) : (
        <ul className="mt-8 space-y-8">
          {users.map((u) => (
            <li
              key={u.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-black">{u.full_name ?? u.email}</p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </div>
                <label className="flex flex-col gap-1 text-xs font-bold uppercase text-zinc-500">
                  Üyelik paketi
                  <select
                    className="rounded-lg border border-black/10 bg-[#F8F9FA] px-3 py-2 text-sm font-medium normal-case text-black"
                    value={u.membership_tier ?? ""}
                    disabled={savingUser === u.id}
                    onChange={(e) =>
                      void saveTier(
                        u.id,
                        e.target.value as MembershipTier | "",
                      )
                    }
                  >
                    <option value="">Atanmadı</option>
                    {(["1", "2", "3"] as MembershipTier[]).map((t) => (
                      <option key={t} value={t}>
                        {formatTier(t)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                Program erişimi
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {programs.map((p) => {
                  const checked = (accessByUser[u.id] ?? []).includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={savingUser === u.id}
                        onChange={(e) =>
                          void toggleProgram(u.id, p.id, e.target.checked)
                        }
                      />
                      {p.title}
                    </label>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
