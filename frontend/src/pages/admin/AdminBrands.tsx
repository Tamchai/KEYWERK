import { useState, type FormEvent } from "react";
import { useAdminBrandsQuery } from "../../hooks/queries/useCatalogQueries";
import type { Brand } from "../../api/types";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminPageShell } from "../../components/admin/adminStyles";
import { useConfirmDialog } from "../../components/ui/dialog-context";
import {
  dangerBtn,
  fieldStyle,
  ghostBtn,
  labelStyle,
  primaryBtn,
  tdStyle,
  thStyle,
  tableStyle,
} from "../../components/admin/adminStyleTokens";
import { useToast } from "../../hooks/useToast";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { usePagination } from "../../hooks/usePagination";
import { useAdminTablePageSize } from "../../hooks/useAdminTablePageSize";

interface FormState {
  id: string | null;
  name: string;
}

const EMPTY_FORM: FormState = { id: null, name: "" };

export const AdminBrands = () => {
  const {
    brandsQuery,
    createBrand,
    updateBrand,
    deleteBrand,
  } = useAdminBrandsQuery();
  const { data: brands = [], isLoading } = brandsQuery;
  const { panelRef, pageSize } = useAdminTablePageSize(brands.length);
  const brandPages = usePagination(brands, pageSize);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { showToast } = useToast();
  const confirmDialog = useConfirmDialog();

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setForm({ id: brand.id, name: brand.name });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (form.id) {
        await updateBrand.mutateAsync({ id: form.id, payload: { name: form.name.trim() } });
        showToast("อัปเดตแบรนด์แล้ว");
      } else {
        await createBrand.mutateAsync({ name: form.name.trim() });
        showToast("เพิ่มแบรนด์แล้ว");
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ", "error");
    }
  };

  const handleDelete = async (brand: Brand) => {
    const confirmed = await confirmDialog({
      title: "ลบแบรนด์",
      description: `ต้องการลบ “${brand.name}” ใช่หรือไม่? การดำเนินการนี้ย้อนกลับไม่ได้`,
      confirmLabel: "ลบแบรนด์",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteBrand.mutateAsync(brand.id);
      showToast("ลบแบรนด์แล้ว");
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
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: 24,
              color: "var(--text)",
            }}
          >
            แบรนด์
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "var(--font-sans)",
              fontSize: 12.5,
              color: "var(--text-dim)",
            }}
          >
            จัดการยี่ห้อสินค้า
          </p>
        </div>
        <button onClick={openCreate} style={primaryBtn}>
          + เพิ่มแบรนด์
        </button>
      </div>

      {brandsQuery.isError ? <p style={{ color: "#e85d5d" }}>{brandsQuery.error.message}</p> : null}
      {isLoading ? (
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--text-dim)" }}>
          กำลังโหลด...
        </p>
      ) : (
        <div ref={panelRef} className="admin-table-panel" style={{ borderRadius: 10, border: "1px solid var(--line)" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ชื่อแบรนด์</th>
                <th style={{ ...thStyle, width: 160, textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {brandPages.items.map((brand) => (
                <tr key={brand.id} style={{ background: "var(--surface)" }}>
                  <td style={tdStyle}>{brand.name}</td>
                  <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button style={ghostBtn} onClick={() => openEdit(brand)}>
                      แก้ไข
                    </button>{" "}
                    <button style={dangerBtn} onClick={() => handleDelete(brand)}>
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!brands.length ? <p style={{ padding: 16 }}>ยังไม่มีแบรนด์</p> : null}
          <AdminPagination {...brandPages} onPageChange={brandPages.setPage} />
        </div>
      )}

      <AdminModal
        open={modalOpen}
        title={form.id ? "แก้ไขแบรนด์" : "เพิ่มแบรนด์"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" style={ghostBtn} onClick={() => setModalOpen(false)}>
              ยกเลิก
            </button>
            <button
              type="submit"
              form="brand-form"
              disabled={createBrand.isPending || updateBrand.isPending}
              style={{ ...primaryBtn, opacity: createBrand.isPending || updateBrand.isPending ? 0.6 : 1 }}
            >
              {createBrand.isPending || updateBrand.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </>
        }
      >
        <form id="brand-form" onSubmit={handleSubmit}>
          <label style={labelStyle}>ชื่อแบรนด์</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="เช่น Keychron, Akko"
            style={fieldStyle}
          />
        </form>
      </AdminModal>

    </AdminPageShell>
  );
};

export default AdminBrands;
