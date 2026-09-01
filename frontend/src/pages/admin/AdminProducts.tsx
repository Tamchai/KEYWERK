import { useState, type FormEvent } from "react";
import { useAdminProductsQuery, useCategoriesQuery, useBrandsQuery } from "../../hooks/queries/useCatalogQueries";
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
import { useToast } from "../../hooks/useToast";

interface FormState {
  id: string | null;
  product_name: string;
  category_id: string;
  brand_id: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  id: null,
  product_name: "",
  category_id: "",
  brand_id: "",
  description: "",
};

export const AdminProducts = () => {
  const {
    productsQuery,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProductsQuery();
  const { data: products = [] } = productsQuery;
  const { data: categories = [] } = useCategoriesQuery();
  const { data: brands = [] } = useBrandsQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { toast, showToast } = useToast();

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? "—";

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product: (typeof products)[number]) => {
    setForm({
      id: product.product_id,
      product_name: product.product_name,
      category_id: product.category_id,
      brand_id: product.brand_id,
      description: product.description ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.category_id || !form.brand_id) {
      showToast("กรุณาเลือกหมวดหมู่และแบรนด์", "error");
      return;
    }
    try {
      const payload = {
        category_id: form.category_id,
        brand_id: form.brand_id,
        product_name: form.product_name.trim(),
        description: form.description.trim(),
      };
      if (form.id) {
        await updateProduct.mutateAsync({ id: form.id, payload });
        showToast("อัปเดตสินค้าแล้ว");
      } else {
        await createProduct.mutateAsync(payload);
        showToast("เพิ่มสินค้าแล้ว");
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ", "error");
    }
  };

  const handleDelete = async (product: (typeof products)[number]) => {
    if (!window.confirm(`ลบสินค้า "${product.product_name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(product.product_id);
      showToast("ลบสินค้าแล้ว");
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
            Products
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12.5,
              color: "var(--text-dim)",
            }}
          >
            จัดการสินค้าหลัก
          </p>
        </div>
        <button onClick={openCreate} style={primaryBtn}>
          + เพิ่มสินค้า
        </button>
      </div>

      {productsQuery.isLoading ? (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-dim)" }}>
          กำลังโหลด...
        </p>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--line)" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ชื่อสินค้า</th>
                <th style={thStyle}>หมวดหมู่</th>
                <th style={thStyle}>แบรนด์</th>
                <th style={thStyle}>ขายแล้ว</th>
                <th style={{ ...thStyle, width: 160, textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id} style={{ background: "var(--surface)" }}>
                  <td style={tdStyle}>{product.product_name}</td>
                  <td style={tdStyle}>{catName(product.category_id)}</td>
                  <td style={tdStyle}>{brandName(product.brand_id)}</td>
                  <td style={tdStyle}>{product.total_sold}</td>
                  <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button style={ghostBtn} onClick={() => openEdit(product)}>
                      แก้ไข
                    </button>{" "}
                    <button style={dangerBtn} onClick={() => handleDelete(product)}>
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
        title={form.id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" style={ghostBtn} onClick={() => setModalOpen(false)}>
              ยกเลิก
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={createProduct.isPending || updateProduct.isPending}
              style={{ ...primaryBtn, opacity: createProduct.isPending || updateProduct.isPending ? 0.6 : 1 }}
            >
              {createProduct.isPending || updateProduct.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit}>
          <label style={labelStyle}>ชื่อสินค้า *</label>
          <input
            required
            value={form.product_name}
            onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
            placeholder="เช่น KEYWERK Origin 65"
            style={fieldStyle}
          />

          <label style={labelStyle}>หมวดหมู่ *</label>
          <select
            required
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            style={fieldStyle}
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label style={labelStyle}>แบรนด์ *</label>
          <select
            required
            value={form.brand_id}
            onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
            style={fieldStyle}
          >
            <option value="">-- เลือกแบรนด์ --</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          <label style={labelStyle}>คำอธิบาย</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            style={fieldStyle}
          />
        </form>
      </AdminModal>

      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </AdminPageShell>
  );
};

export default AdminProducts;
