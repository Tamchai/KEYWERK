import { useState } from "react";
import type { Address, AddressPayload } from "../api/types";
import AccountShell from "../components/account/AccountShell";
import { button, input, panel } from "../components/account/accountStyles";
import { useAddressesQuery } from "../hooks/queries/useCommerceQueries";
import { useConfirmDialog } from "../components/ui/dialog-context";

const emptyAddress: AddressPayload = {
  title: "บ้าน",
  receiver_name: "",
  phone_number: "",
  address_line1: "",
  address_line2: "",
  district: "",
  province: "",
  postal_code: "",
  is_default: true,
};

const fields: Array<[keyof AddressPayload, string, boolean?]> = [
  ["title", "ชื่อที่อยู่ เช่น บ้าน", true],
  ["receiver_name", "ชื่อผู้รับ", true],
  ["phone_number", "เบอร์โทร", true],
  ["address_line1", "ที่อยู่", true],
  ["address_line2", "รายละเอียดเพิ่มเติม"],
  ["district", "เขต/อำเภอ", true],
  ["province", "จังหวัด", true],
  ["postal_code", "รหัสไปรษณีย์", true],
];

function payloadFrom(address: Address): AddressPayload {
  const { title, receiver_name, phone_number, address_line1, address_line2, district, province, postal_code, is_default } = address;
  return { title, receiver_name, phone_number, address_line1, address_line2, district, province, postal_code, is_default };
}

export default function Addresses() {
  const { addressesQuery, saveAddress, deleteAddress } = useAddressesQuery();
  const confirmDialog = useConfirmDialog();
  const [form, setForm] = useState<AddressPayload>(emptyAddress);
  const [editingId, setEditingId] = useState<string | undefined>();
  const error = addressesQuery.error ?? saveAddress.error ?? deleteAddress.error;

  const reset = () => {
    setForm(emptyAddress);
    setEditingId(undefined);
  };

  const setField = (key: keyof AddressPayload, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    saveAddress.mutate({ id: editingId, payload: form }, { onSuccess: reset });
  };

  const removeAddress = async (addressId: string) => {
    const confirmed = await confirmDialog({
      title: "ลบที่อยู่จัดส่ง",
      description: "ที่อยู่นี้จะถูกลบออกจากบัญชีของคุณ",
      confirmLabel: "ลบที่อยู่",
      destructive: true,
    });
    if (confirmed) deleteAddress.mutate(addressId);
  };

  return (
    <AccountShell title="ที่อยู่จัดส่ง">
      <form onSubmit={submit} style={{ ...panel, marginBottom: 20 }}>
        <h2 style={{ marginBottom: 16 }}>{editingId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          {fields.map(([key, label, required]) => (
            <input key={key} style={input} required={required} placeholder={label} value={String(form[key])} onChange={(event) => setField(key, event.target.value)} />
          ))}
        </div>
        <label style={{ display: "block", margin: "14px 0" }}>
          <input type="checkbox" checked={form.is_default} onChange={(event) => setField("is_default", event.target.checked)} /> ใช้เป็นค่าเริ่มต้น
        </label>
        {error ? <p style={{ color: "#e85d5d" }}>{error.message}</p> : null}
        <button type="submit" style={{ ...button, marginTop: 12 }} disabled={saveAddress.isPending}>บันทึกที่อยู่</button>
        {editingId ? <button type="button" style={{ marginLeft: 10 }} onClick={reset}>ยกเลิก</button> : null}
      </form>
      {addressesQuery.isLoading ? <p>กำลังโหลด...</p> : null}
      <div style={{ display: "grid", gap: 12 }}>
        {addressesQuery.data?.map((address) => (
          <article key={address.address_id} style={panel}>
            <strong>{address.title}{address.is_default ? " · ค่าเริ่มต้น" : ""}</strong>
            <p>{address.receiver_name} · {address.phone_number}</p>
            <p>{address.address_line1} {address.address_line2} {address.district} {address.province} {address.postal_code}</p>
            <button type="button" onClick={() => { setEditingId(address.address_id); setForm(payloadFrom(address)); }}>แก้ไข</button>
            <button type="button" style={{ marginLeft: 10, color: "#e85d5d" }} disabled={deleteAddress.isPending} onClick={() => void removeAddress(address.address_id)}>ลบ</button>
          </article>
        ))}
      </div>
    </AccountShell>
  );
}
