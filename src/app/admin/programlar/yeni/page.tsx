import { ProgramForm } from "@/components/admin/ProgramForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProgramNewPage() {
  const supabase = await createClient();
  const { data: homePackages } = await supabase
    .from("home_packages")
    .select("id,title,level_display,sort_order")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight">
        Yeni program
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Bir ev paketine atadığınızda, o paket seviyesine (1 / 2 / 3) sahip üyeler
        programı otomatik görür. İsterseniz üyeler sayfasından tek tek de
        işaretleyebilirsiniz.
      </p>
      <div className="mt-8">
        <ProgramForm mode="create" homePackages={homePackages ?? []} />
      </div>
    </div>
  );
}
