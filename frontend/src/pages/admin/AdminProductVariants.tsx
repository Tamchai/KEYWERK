import { useState, type FormEvent } from "react";
import { useAdminProductVariantsQuery } from "../../hooks/queries/useCatalogQueries";
import {
  AdminPageShell,
  dangerBtn,
  fieldStyle,
  ghostBtn,
  labelStyle,
  primaryBtn,
  tdStyle,
  thStyle,
  Toast,
  tableStyle,
} from "../../components/admin/adminStyles";
import { AdminModal } from "../../components/admin/AdminModal";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { useToast } from "../../hooks/useToast";
import { resolveImageUrl } from "../../utils/image";
import type { ProductVariant } from "../../api/types";

interface FormState {
  variant_id: string | null;
  product_id: string;
  variant_name: string;
  price: string;
  stock: string;
  image_id: string;
  image_url: string;
  attributes: string;
}

const EMPTY_FORM: FormState = {
  variant_id: null,
  product_id: "",
  variant_name: "",
  price: "",
  stock: "0",
  image_id: "",
  image_url: "",
  attributes: "",
};

export const AdminProductVariants = () => {
  const {
    variantsQuery,
    productsQuery,
    createVariant,
    updateVariant,
    deleteVariant,
  } = useAdminProductVariantsQuery();
  const { data: variants = [], isLoading } = variantsQuery;
  const { data: products = [] } = productsQuery;

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { toast, showToast } = useToast();

  const productName = (id: string) => products.find((p) => p.product_id === id)?.product_name ?? "—";

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (variant: ProductVariant) => {
    setForm({
      variant_id: variant.variant_id,
      product_id: variant.product_id,
      variant_name: variant.variant_name,
      price: String(variant.price),
      stock: String(variant.stock),
      image_id: variant.image_id ?? "",
      image_url: variant.image_url ?? "",
      attributes: variant.attributes ? JSON.stringify(variant.attributes, null, 2) : "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.product_id) {
      showToast("กรุณาเลือกสินค้า", "error");
      return;
    }
    if (form.price === "" || Number.isNaN(Number(form.price))) {
      showToast("กรุณากรอกราคาให้ถูกต้อง", "error");
      return;
    }

    let attributes: Record<string, unknown> = {};
    if (form.attributes.trim()) {
      try {
        const parsed: unknown = JSON.parse(form.attributes);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          showToast("คุณสมบัติต้องเป็น JSON object (เช่น {\"color\":\"ดำ\"})", "error");
          return;
        }
        attributes = parsed as Record<string, unknown>;
      } catch {
        showToast("คุณสมบัติต้องเป็น JSON ที่ถูกต้อง", "error");
        return;
      }
    }

    try {
      const payload = {
        product_id: form.product_id,
        variant_name: form.variant_name.trim(),
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        image_id: form.image_id || undefined,
        attributes,
      };
      if (form.variant_id) {
        await updateVariant.mutateAsync({ id: form.variant_id, payload });
        showToast("อัปเดต variant แล้ว");
      } else {
        await createVariant.mutateAsync(payload);
        showToast("เพิ่ม variant แล้ว");
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ", "error");
    }
  };

  const handleDelete = async (variant: ProductVariant) => {
    if (!window.confirm(`ลบ variant "${variant.variant_name}"?`)) return;
    try {
      await deleteVariant.mutateAsync(variant.variant_id);
      showToast("ลบ variant แล้ว");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "ลบไม่สำเร็จ", "error");
    }
  };

  return (
    <AdminPageShell>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: 24,
              color: "var(--text)",
            }}
          >
            Product Variants
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12.5,
              color: "var(--text-dim)",
            }}
          >
            จัดการตัวเลือกสินค้า (SKU) + รูปภาพ
          </p>
        </div>
        <button onClick={openCreate} style={primaryBtn}>
          + เพิ่ม variant
        </button>
      </div>

      {isLoading ? (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-dim)" }}>
          กำลังโหลด...
        </p>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--line)" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>รูป</th>
                <th style={thStyle}>Variant</th>
                <th style={thStyle}>สินค้า</th>
                <th style={thStyle}>ราคา</th>
                <th style={thStyle}>สต็อก</th>
                <th style={thStyle}>คุณสมบัติ</th>
                <th style={{ ...thStyle, width: 160, textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.variant_id} style={{ background: "var(--surface)" }}>
                  <td style={tdStyle}>
                    {variant.image_url ? (
                      <img
                        src={resolveImageUrl(variant.image_url)}
                        alt=""
                        style={{
                          width: 44,
                          height: 44,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                          display: "block",
                        }}
                      />
                    ) : (
                      <span style={{ color: "var(--text-dim)" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>{variant.variant_name}</td>
                  <td style={tdStyle}>{productName(variant.product_id)}</td>
                  <td style={tdStyle}>฿{variant.price.toLocaleString()}</td>
                  <td style={tdStyle}>{variant.stock}</td>
                  <td style={{ ...tdStyle, maxWidth: 260 }}>
                    {variant.attributes && Object.keys(variant.attributes).length > 0 ? (
                      <span
                        title={JSON.stringify(variant.attributes)}
                        style={{
                          display: "block",
                          color: "var(--text-dim)",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {JSON.stringify(variant.attributes)}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-dim)" }}>—</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button style={ghostBtn} onClick={() => openEdit(variant)}>
                      แก้ไข
                    </button>{" "}
                    <button style={dangerBtn} onClick={() => handleDelete(variant)}>
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal
        open={modalOpen}
        title={form.variant_id ? "แก้ไข variant" : "เพิ่ม variant"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" style={ghostBtn} onClick={() => setModalOpen(false)}>
              ยกเลิก
            </button>
            <button
              type="submit"
              form="variant-form"
              disabled={createVariant.isPending || updateVariant.isPending}
              style={{ ...primaryBtn, opacity: createVariant.isPending || updateVariant.isPending ? 0.6 : 1 }}
            >
              {createVariant.isPending || updateVariant.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </>
        }
      >
        <form id="variant-form" onSubmit={handleSubmit}>
          <label style={labelStyle}>สินค้า *</label>
          <select
            required
            value={form.product_id}
            onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
            style={fieldStyle}
          >
            <option value="">— เลือกสินค้า —</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name}
              </option>
            ))}
          </select>

          <label style={labelStyle}>ชื่อ variant / SKU *</label>
          <input
            required
            value={form.variant_name}
            onChange={(e) => setForm((f) => ({ ...f, variant_name: e.target.value }))}
            placeholder="เช่น SKU K2H-F1C"
            style={fieldStyle}
          />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>ราคา (บาท) *</label>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                style={fieldStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>สต็อก</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                style={fieldStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>คุณสมบัติ (JSON)</label>
          <textarea
            value={form.attributes}
            onChange={(e) => setForm((f) => ({ ...f, attributes: e.target.value }))}
            placeholder={'เช่น\n{"color":"Concrete Edition","layout":"75%","language":"English"}'}
            spellCheck={false}
            style={{ ...fieldStyle, minHeight: 108, resize: "vertical", lineHeight: 1.5 }}
          />

          <label style={labelStyle}>รูปภาพ</label>
          <ImageUploader
            imageId={form.image_id}
            imageUrl={form.image_url}
            onUploaded={(imageId, imageUrl) =>
              setForm((f) => ({ ...f, image_id: imageId, image_url: imageUrl ?? "" }))
            }
          />
        </form>
      </AdminModal>

      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </AdminPageShell>
  );
};

export default AdminProductVariants;
