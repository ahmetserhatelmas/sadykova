import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export default async function PanelProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/panel/profil");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="mt-8">
      <h1 className="text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Profil ayarları
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
        Görünen adınız üye panelinde ve iletişimde kullanılır. Şifrenizi buradan
        güncelleyebilirsiniz.
      </p>
      <ProfileForm
        userId={user.id}
        email={user.email}
        initialName={profile?.full_name ?? ""}
      />
    </div>
  );
}
