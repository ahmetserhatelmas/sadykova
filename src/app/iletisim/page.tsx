import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";

export default function IletisimPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <Link href="/" className="text-sm font-bold text-zinc-600 hover:text-black">
        ← Ana sayfa
      </Link>
      <h1 className="mt-6 text-2xl font-black uppercase">İletişim</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
        Aşağıdaki formu doldurun; mesajınız güvenle kaydedilir ve en kısa sürede
        size dönüş yapılır.
      </p>
      <div className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <ContactForm />
      </div>
    </div>
  );
}
