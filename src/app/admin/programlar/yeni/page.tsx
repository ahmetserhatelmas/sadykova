import { ProgramForm } from "@/components/admin/ProgramForm";

export default function AdminProgramNewPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight">
        Yeni program
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Önce programı kaydedin; kapak ve video yüklemek isteğe bağlıdır. Tam içerik
        sadece erişim verdiğiniz üyelere açılır.
      </p>
      <div className="mt-8">
        <ProgramForm mode="create" />
      </div>
    </div>
  );
}
