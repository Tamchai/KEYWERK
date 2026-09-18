import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  image: string;
  images: string[];
  category: string;
  brand?: string;
  name: string;
  price: string;
  href: string;
}

export const ProductCard = ({ image, images, category, brand, name, price, href }: ProductCardProps) => {
  const gallery = images.length > 0 ? images : [image];
  const [activeIndex, setActiveIndex] = useState(0);
  const hasGallery = gallery.length > 1;

  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + gallery.length) % gallery.length);
  };

  return (
    <article className="kw-product-card group flex flex-col overflow-hidden border border-[var(--line)]">
      <div className="group relative aspect-square overflow-hidden bg-[#0a0906]">
        <Link className="block h-full w-full" to={href} aria-label={`ดูรายละเอียด ${name}`}>
          <img
            className="h-full w-full object-cover"
            src={gallery[activeIndex]}
            alt={`${name} รูปที่ ${activeIndex + 1}`}
            loading="lazy"
            decoding="async"
          />
        </Link>

        {hasGallery ? <>
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <Images size={13} /> {activeIndex + 1} / {gallery.length}
          </div>
          <button
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center !rounded-full border border-white/15 bg-black/65 text-white opacity-0 backdrop-blur-md transition hover:bg-[var(--accent)] hover:text-[#18140a] group-hover:opacity-100 focus-visible:opacity-100"
            type="button"
            onClick={() => move(-1)}
            aria-label={`ดูรูปก่อนหน้าของ ${name}`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center !rounded-full border border-white/15 bg-black/65 text-white opacity-0 backdrop-blur-md transition hover:bg-[var(--accent)] hover:text-[#18140a] group-hover:opacity-100 focus-visible:opacity-100"
            type="button"
            onClick={() => move(1)}
            aria-label={`ดูรูปถัดไปของ ${name}`}
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-2 backdrop-blur-md" role="group" aria-label={`เลือกรูปของ ${name}`}>
            {gallery.map((src, index) => (
              <button
                className={`h-1.5 border-0 p-0 transition-all ${index === activeIndex ? "w-5 bg-[var(--accent)]" : "w-1.5 bg-white/50 hover:bg-white"} !rounded-full`}
                type="button"
                key={src}
                onClick={() => setActiveIndex(index)}
                aria-label={`ดูรูปที่ ${index + 1}`}
                aria-pressed={index === activeIndex}
              />
            ))}
          </div>
        </> : null}
      </div>

      <Link className="flex flex-1 flex-col p-[18px] no-underline" to={href}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {brand ? <p className="truncate text-[11px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">{brand}</p> : null}
            <p className="mt-1 text-xs text-[var(--text-dim)]">{category}</p>
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center !rounded-full bg-white/5 text-[var(--text-dim)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-[#18140a]"><ArrowUpRight size={16} /></span>
        </div>
        <h3 className="mb-4 line-clamp-2 text-base font-bold leading-snug text-[var(--text)]">{name}</h3>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--line)] pt-3">
          <span className="text-[11px] text-[var(--text-dim)]">ราคาเริ่มต้น</span>
          <strong className="text-base text-[var(--accent)]">{price}</strong>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
