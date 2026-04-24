import Link from "next/link";

export default function SozlesmePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <Link href="/" className="text-sm font-bold text-zinc-600 hover:text-black">
        ← Ana sayfa
      </Link>
      <h1 className="mt-6 text-2xl font-black uppercase">Kullanım koşulları</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
        Bu sayfa yer tutucudur. Mesafeli satış / kullanım sözleşmenizi buraya
        ekleyebilirsiniz.
      </p>
    </div>
  );
}
