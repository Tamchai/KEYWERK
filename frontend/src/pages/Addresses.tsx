import { useState, type FormEvent } from "react";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { Address, AddressPayload } from "../api/types";
import AccountShell from "../components/account/AccountShell";
import { useAddressesQuery } from "../hooks/queries/useCommerceQueries";
import { useConfirmDialog } from "../components/ui/dialog-context";

const emptyAddress: AddressPayload = {
  title: "บ้าน", receiver_name: "", phone_number: "", address_line1: "", address_line2: "",
  district: "", province: "", postal_code: "", is_default: true,
};

type TextField = Exclude<keyof AddressPayload, "is_default">;
const fields: Array<{ key: TextField; label: string; placeholder: string; required?: boolean; wide?: boolean }> = [
  { key: "title", label: "ชื่อที่อยู่", placeholder: "เช่น บ้าน, ที่ทำงาน", required: true },
  { key: "receiver_name", label: "ชื่อผู้รับ", placeholder: "ชื่อ-นามสกุล", required: true },
  { key: "phone_number", label: "เบอร์โทรศัพท์", placeholder: "เบอร์สำหรับติดต่อจัดส่ง", required: true },
  { key: "address_line1", label: "ที่อยู่", placeholder: "บ้านเลขที่ ถนน ซอย", required: true, wide: true },
  { key: "address_line2", label: "รายละเอียดเพิ่มเติม", placeholder: "อาคาร ชั้น หรือจุดสังเกต (ถ้ามี)", wide: true },
  { key: "district", label: "เขต / อำเภอ", placeholder: "เขตหรืออำเภอ", required: true },
  { key: "province", label: "จังหวัด", placeholder: "จังหวัด", required: true },
  { key: "postal_code", label: "รหัสไปรษณีย์", placeholder: "5 หลัก", required: true },
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
  const addresses = addressesQuery.data ?? [];

  const reset = () => { setForm(emptyAddress); setEditingId(undefined); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveAddress.mutate({ id: editingId, payload: form }, { onSuccess: reset });
  };
  const removeAddress = async (addressId: string) => {
    const confirmed = await confirmDialog({ title: "ลบที่อยู่จัดส่ง", description: "ที่อยู่นี้จะถูกลบออกจากบัญชีของคุณ", confirmLabel: "ลบที่อยู่", destructive: true });
    if (confirmed) deleteAddress.mutate(addressId);
  };

  return <AccountShell title="ที่อยู่จัดส่ง">
    <div className="kw-address-layout">
      <section className="kw-address-form-panel" aria-labelledby="address-form-title">
        <div className="kw-address-panel-heading"><div><p className="kw-address-kicker">ข้อมูลสำหรับจัดส่ง</p><h2 id="address-form-title">{editingId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}</h2></div><MapPin size={25} /></div>
        <p className="kw-address-help">กรอกข้อมูลที่พนักงานจัดส่งใช้ติดต่อและค้นหาที่อยู่ของคุณ</p>
        <form onSubmit={submit}>
          <div className="kw-address-fields">
            {fields.map((field) => <label className={field.wide ? "kw-address-field kw-address-field-wide" : "kw-address-field"} key={field.key}>
              <span>{field.label}{field.required ? <em> *</em> : null}</span>
              <input required={field.required} type={field.key === "phone_number" ? "tel" : "text"} inputMode={field.key === "postal_code" ? "numeric" : undefined} autoComplete={field.key === "postal_code" ? "postal-code" : undefined} placeholder={field.placeholder} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} />
            </label>)}
          </div>
          <button type="button" role="switch" aria-checked={form.is_default} className="kw-address-default" onClick={() => setForm((current) => ({ ...current, is_default: !current.is_default }))}>
            <span className="kw-switch-track"><span className="kw-switch-thumb" /></span>
            <span><strong>ใช้เป็นที่อยู่เริ่มต้น</strong><small>ระบบจะเลือกที่อยู่นี้เมื่อสั่งซื้อครั้งถัดไป</small></span>
          </button>
          {error ? <p role="alert" className="kw-address-error">{error.message}</p> : null}
          <div className="kw-address-form-actions"><button className="kw-address-save" type="submit" disabled={saveAddress.isPending}>{saveAddress.isPending ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "บันทึกที่อยู่"}</button>{editingId ? <button className="kw-address-cancel" type="button" onClick={reset}>ยกเลิก</button> : null}</div>
        </form>
      </section>

      <section className="kw-address-list" aria-labelledby="saved-addresses-title">
        <div className="kw-address-list-heading"><div><p className="kw-address-kicker">สมุดที่อยู่</p><h2 id="saved-addresses-title">ที่อยู่ที่บันทึกไว้</h2></div><span>{addresses.length.toLocaleString("th-TH")} รายการ</span></div>
        {addressesQuery.isLoading ? <p className="kw-address-empty">กำลังโหลดที่อยู่...</p> : null}
        {!addressesQuery.isLoading && addresses.length === 0 ? <div className="kw-address-empty"><MapPin size={29} /><strong>ยังไม่มีที่อยู่จัดส่ง</strong><p>เพิ่มที่อยู่แรกทางฟอร์มด้านซ้ายเพื่อใช้ตอนสั่งซื้อ</p></div> : null}
        <div className="kw-address-cards">
          {addresses.map((address) => <article className={address.is_default ? "kw-address-card is-default" : "kw-address-card"} key={address.address_id}>
            <div className="kw-address-card-top"><span className="kw-address-card-icon"><MapPin size={20} /></span><div><h3>{address.title}</h3>{address.is_default ? <span className="kw-address-default-badge"><Check size={13} /> ค่าเริ่มต้น</span> : null}</div></div>
            <p className="kw-address-recipient">{address.receiver_name} <span>{address.phone_number}</span></p>
            <p className="kw-address-lines">{address.address_line1}{address.address_line2 ? ` ${address.address_line2}` : ""}<br />{address.district} {address.province} {address.postal_code}</p>
            <div className="kw-address-card-actions"><button type="button" onClick={() => { setEditingId(address.address_id); setForm(payloadFrom(address)); document.getElementById("address-form-title")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><Pencil size={15} />แก้ไข</button><button type="button" className="is-danger" disabled={deleteAddress.isPending} onClick={() => void removeAddress(address.address_id)}><Trash2 size={15} />ลบ</button></div>
          </article>)}
        </div>
        {addresses.length > 0 && !editingId ? <div className="kw-address-tip"><Plus size={18} />เพิ่มที่อยู่สำหรับบ้านหรือที่ทำงานอีกแห่งได้จากแบบฟอร์มด้านซ้าย</div> : null}
      </section>
    </div>
  </AccountShell>;
}
