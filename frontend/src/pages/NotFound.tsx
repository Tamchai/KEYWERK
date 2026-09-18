import { Link } from "react-router-dom";
import AccountShell from "../components/account/AccountShell";
import { panel } from "../components/account/accountStyles";

export default function NotFound() {
  return (
    <AccountShell title="ไม่พบหน้านี้">
      <div style={panel}>
        <p>ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายแล้ว</p>
        <Link to="/">กลับหน้าแรก</Link>
      </div>
    </AccountShell>
  );
}
