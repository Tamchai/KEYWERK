import { useState, useRef, useCallback, useEffect } from "react";

export interface CarouselImage {
  src: string;
  alt?: string;
}

interface CarouselProps {
  images: CarouselImage[];
  height?: number;
}

export const Carousel = ({ images, height = 400 }: CarouselProps) => {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);

  const total = images.length;
  const hasMultiple = total > 1;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total],
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current > 0) prev();
      else next();
    }
    touchDelta.current = 0;
  };

  if (total === 0) {
    return (
      <div
        style={{
          height,
          background: "#0a0906",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-dim)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
        }}
      >
        ไม่มีรูปภาพ
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Track */}
      <div
        ref={trackRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%",
          height,
          overflow: "hidden",
          borderRadius: 12,
          background: "#0a0906",
          position: "relative",
          cursor: hasMultiple ? "grab" : "default",
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${total * 100}%`,
            transform: `translateX(-${(current * 100) / total}%)`,
            transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
            height: "100%",
          }}
        >
          {images.map((img, i) => (
            <div
              key={img.src + i}
              style={{
                width: `${100 / total}%`,
                height: "100%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={img.src}
                alt={img.alt ?? ""}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  userSelect: "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={prev}
            aria-label="รูปก่อนหน้า"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(14,12,8,0.75)",
              border: "1px solid var(--line)",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              lineHeight: 1,
              transition: "background 0.15s, border-color 0.15s",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(14,12,8,0.92)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(14,12,8,0.75)";
              e.currentTarget.style.borderColor = "var(--line)";
            }}
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="รูปถัดไป"
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(14,12,8,0.75)",
              border: "1px solid var(--line)",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              lineHeight: 1,
              transition: "background 0.15s, border-color 0.15s",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(14,12,8,0.92)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(14,12,8,0.75)";
              e.currentTarget.style.borderColor = "var(--line)";
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {hasMultiple && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 14,
          }}
        >
          {images.map((img, i) => (
            <button
              key={img.src + i}
              onClick={() => goTo(i)}
              aria-label={`รูปที่ ${i + 1}`}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === current ? "var(--accent)" : "var(--line)",
                cursor: "pointer",
                transition: "width 0.2s, background 0.2s",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
