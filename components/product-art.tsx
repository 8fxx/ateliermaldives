type ArtProduct = { name: string; category: string; badge: string | null; paletteBg: string; paletteFg: string };

// Typographic stand-in for product photography. Swap for next/image once shoots are done.
export function ProductArt({ product, large = false }: { product: ArtProduct; large?: boolean }) {
  const { paletteBg: bg, paletteFg: fg } = product;
  return (
    <div
      className="relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-2xl p-5"
      style={{ background: bg, color: fg }}
    >
      <div className="flex items-start justify-between">
        <span className="eyebrow">{product.category}</span>
        {product.badge && (
          <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest" style={{ background: fg, color: bg }}>
            {product.badge}
          </span>
        )}
      </div>
      <svg viewBox="0 0 200 120" className="absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-15" aria-hidden>
        <path d="M0 70 Q 50 40 100 70 T 200 70" fill="none" stroke={fg} strokeWidth="1.5" />
        <path d="M0 85 Q 50 55 100 85 T 200 85" fill="none" stroke={fg} strokeWidth="1.5" />
        <path d="M0 100 Q 50 70 100 100 T 200 100" fill="none" stroke={fg} strokeWidth="1.5" />
      </svg>
      <p className={`relative font-serif leading-[0.9] ${large ? "text-7xl" : "text-5xl"}`}>
        {product.name.split(" ").map((word, i) => (
          <span key={i} className={`block ${i % 2 ? "italic" : ""}`}>
            {word}
          </span>
        ))}
      </p>
    </div>
  );
}
