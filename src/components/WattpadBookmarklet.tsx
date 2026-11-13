"use client";

export function WattpadBookmarklet() {
  return (
    <section className="mb-10 rounded-2xl border border-emerald-400/50 bg-emerald-50/30 p-6 dark:bg-emerald-950/20">
      <h2 className="mb-2 font-serif text-lg text-[var(--color-text)]">
        Eklentiyi kur (bir kez) — sonra tek tık
      </h2>
      <p className="mb-4 text-xs leading-relaxed text-[var(--color-text-muted)]">
        Konsol ve yer imi Wattpad&apos;te sorun çıkarıyor. Bunun yerine projedeki eklentiyi kur;
        her kitapta sağ altta mor <strong>Ay Işığı&apos;na Aktar</strong> düğmesi çıkar.
      </p>

      <ol className="mb-4 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-[var(--color-text-muted)]">
        <li>
          Opera adres çubuğuna yaz:{" "}
          <code className="rounded bg-[var(--color-bg)] px-1">opera://extensions</code>
        </li>
        <li>
          <strong>Geliştirici modu</strong> aç
        </li>
        <li>
          <strong>Paketlenmemiş uzantı yükle</strong> → şu klasörü seç:
          <br />
          <code className="mt-1 block rounded bg-[var(--color-bg)] px-2 py-1 text-[11px]">
            /Users/macbook/Projects/wattpad-okuma/extension
          </code>
        </li>
        <li>
          <code className="rounded bg-[var(--color-bg)] px-1">npm run dev</code> çalışsın
        </li>
        <li>Her kitapta <strong>Wattpad&apos;te aç</strong> → mor düğme → admin&apos;i yenile</li>
      </ol>

      <p className="text-xs text-[var(--color-text-muted)]">
        4 kitap için her birinin Wattpad sayfasında mor düğmeye bas.
      </p>
    </section>
  );
}
