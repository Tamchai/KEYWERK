import { useState, type FormEvent } from "react";
import { useAdminCategoriesQuery } from "../../hooks/queries/useCatalogQueries";
import type { Category } from "../../api/types";
import { AdminModal } from "../../components/admin/AdminModal";
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
import { useToast } from "../../hooks/useToast";

interface FormState {
  id: string | null;
  name: string;
}

const EMPTY_FORM: FormState = { id: null, name: "" };

export const AdminCategories = () => {
  const {
    categoriesQuery,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategoriesQuery();
  const { data: categories = [], isLoading } = categoriesQuery;

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { toast, showToast } = useToast();

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setForm({ id: category.id, name: category.name });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (form.id) {
        await updateCategory.mutateAsync({ id: form.id, payload: { name: form.name.trim() } });
        showToast("อัปเดตหมวดหมู่แล้ว");
      } else {
        await createCategory.mutateAsync({ name: form.name.trim() });
        showToast("เพิ่มหมวดหมู่แล้ว");
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ", "error");
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`ลบหมวดหมู่ "${category.name}"?`)) return;
    try {
      await deleteCategory.mutateAsync(category.id);
      showToast("ลบหมวดหมู่แล้ว");
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
            Categories
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12.5,
              color: "var(--text-dim)",
            }}
          >
            จัดการหมวดหมู่สินค้า
          </p>
        </div>
        <button onClick={openCreate} style={primaryBtn}>
          + เพิ่มหมวดหมู่
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
                <th style={thStyle}>ชื่อหมวดหมู่</th>
                <th style={{ ...thStyle, width: 160, textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} style={{ background: "var(--surface)" }}>
                  <td style={tdStyle}>{category.name}</td>
                  <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button style={ghostBtn} onClick={() => openEdit(category)}>
                      แก้ไข
                    </button>{" "}
                    <button style={dangerBtn} onClick={() => handleDelete(category)}>
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
        title={form.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" style={ghostBtn} onClick={() => setModalOpen(false)}>
              ยกเลิก
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={createCategory.isPending || updateCategory.isPending}
              style={{ ...primaryBtn, opacity: createCategory.isPending || updateCategory.isPending ? 0.6 : 1 }}
            >
              {createCategory.isPending || updateCategory.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit}>
          <label style={labelStyle}>ชื่อหมวดหมู่</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="เช่น Mechanical, Keycaps, Switches"
            style={fieldStyle}
          />
        </form>
      </AdminModal>

      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </AdminPageShell>
  );
};

export default AdminCategories;
