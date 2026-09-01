import { useParams, Link } from "react-router-dom";
import { useProductDetailQuery } from "../hooks/queries/useCatalogQueries";
import { Carousel } from "../components/products/Carousel";
import { resolveProductImage, resolveImageUrl } from "../utils/image";
import { formatPriceTHB } from "../utils/format";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCartStore } from "../stores/cartStore";
import { useToast } from "../hooks/useToast";

export const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { product, variants, brands, categories, isLoading, isError, error } =
    useProductDetailQuery(productId);
  const { addToCart } = useCartStore();
  const { showToast } = useToast();

  const brandName = brands.find((b) => b.id === product?.brand_id)?.name;
  const categoryName = categories.find((c) => c.id === product?.category_id)?.name;

  const handleAddToCart = async (variantId: string) => {
    try {
      await addToCart(variantId, 1);
      showToast("เพิ่มลงตะกร้าแล้ว", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "เพิ่มลงตะกร้าไม่สำเร็จ", "error");
    }
  };

  const carouselImages = variants
    .filter((v) => v.image_url)
    .map((v) => ({
      src: resolveImageUrl(v.image_url!) ?? "",
      alt: `${product?.product_name ?? ""} — ${v.variant_name}`,
    }));

  const fallbackImage = product
    ? resolveProductImage(product, variants)
    : undefined;

  const imagesToShow =
    carouselImages.length > 0
      ? carouselImages
      : fallbackImage
        ? [{ src: fallbackImage, alt: product?.product_name ?? "" }]
        : [];

  return (
    <>
      <Navbar />
      <section
        style={{
          background: "var(--bg)",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          boxSizing: "border-box",
          padding: "clamp(32px, 5vw, 56px) clamp(20px, 5vw, 64px)",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {isLoading && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-dim)" }}>
              กำลังโหลด...
            </p>
          )}

          {isError && (
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e85d5d" }}>
                {error || "ไม่พบสินค้า"}
              </p>
              <Link
                to="/"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                ← กลับหน้าแรก
              </Link>
            </div>
          )}

          {!isLoading && !isError && product && (
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              <nav
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12.5,
                  color: "var(--text-dim)",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Link to="/" style={{ color: "var(--text-dim)", textDecoration: "none" }}>
                  Home
                </Link>
                <span>/</span>
                {categoryName && (
                  <>
                    <span style={{ color: "var(--text)" }}>{categoryName}</span>
                    <span>/</span>
                  </>
                )}
                <span style={{ color: "var(--text)" }}>{product.product_name}</span>
              </nav>

              <div className="product-detail-grid">
                <div>
                  <Carousel images={imagesToShow} height={420} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {brandName && (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        fontSize: 11.5,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                      }}
                    >
                      {brandName}
                    </p>
                  )}

                  <h1
                    style={{
                      margin: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 800,
                      fontSize: "clamp(22px, 3vw, 30px)",
                      color: "var(--text)",
                      lineHeight: 1.3,
                    }}
                  >
                    {product.product_name}
                  </h1>

                  {product.description && (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13.5,
                        color: "var(--text-dim)",
                        lineHeight: 1.7,
                      }}
                    >
                      {product.description}
                    </p>
                  )}

                  {variants.length > 0 && (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 800,
                        fontSize: 22,
                        color: "var(--accent)",
                      }}
                    >
                      {formatPriceTHB(Math.min(...variants.map((v) => v.price)))}
                      {variants.length > 1 && (
                        <span
                          style={{
                            fontWeight: 400,
                            fontSize: 13,
                            color: "var(--text-dim)",
                            marginLeft: 8,
                          }}
                        >
                          — {variants.length} ตัวเลือก
                        </span>
                      )}
                    </p>
                  )}

                  {product.total_sold > 0 && (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12.5,
                        color: "var(--text-dim)",
                      }}
                    >
                      ขายแล้ว {product.total_sold.toLocaleString()} ชิ้น
                    </p>
                  )}
                </div>
              </div>

              {variants.length > 0 && (
                <div>
                  <h2
                    style={{
                      margin: "0 0 16px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 800,
                      fontSize: 18,
                      color: "var(--text)",
                    }}
                  >
                    ตัวเลือกสินค้า
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {variants.map((variant) => (
                      <div
                        key={variant.variant_id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "72px 1fr auto",
                          gap: 16,
                          alignItems: "center",
                          padding: 16,
                          borderRadius: 10,
                          border: "1px solid var(--line)",
                          background: "var(--surface)",
                        }}
                      >
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#0a0906",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {variant.image_url ? (
                            <img
                              src={resolveImageUrl(variant.image_url) ?? ""}
                              alt={variant.variant_name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span style={{ color: "var(--text-dim)", fontSize: 11 }}>—</span>
                          )}
                        </div>

                        <div>
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 700,
                              fontSize: 14,
                              color: "var(--text)",
                            }}
                          >
                            {variant.variant_name}
                          </p>
                          {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {Object.entries(variant.attributes).map(([key, val]) => (
                                <span
                                  key={key}
                                  style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 11,
                                    color: "var(--text-dim)",
                                    background: "var(--bg)",
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {key}: {String(val)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 700,
                              fontSize: 15,
                              color: "var(--accent)",
                            }}
                          >
                            {formatPriceTHB(variant.price)}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 12,
                              color: variant.stock > 0 ? "var(--text-dim)" : "#e85d5d",
                            }}
                          >
                            {variant.stock > 0 ? `คงเหลือ ${variant.stock}` : "สินค้าหมด"}
                          </p>
                          {variant.stock > 0 && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(variant.variant_id)}
                              style={{
                                background: "var(--accent)",
                                color: "var(--bg)",
                                border: "none",
                                borderRadius: 6,
                                padding: "8px 16px",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "opacity 0.2s ease",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                            >
                              เพิ่มลงตะกร้า
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ProductDetail;
