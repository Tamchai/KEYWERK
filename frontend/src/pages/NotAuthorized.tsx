import { Link } from "react-router-dom";
import AccountShell from "../components/account/AccountShell";
import { panel } from "../components/account/accountStyles";

export default function NotAuthorized() {
  return (
    <AccountShell title="ไม่มีสิทธิ์เข้าถึง">
      <div style={panel}>
        <p>บัญชีนี้ไม่มีสิทธิ์เปิดหน้าผู้ดูแลระบบ</p>
        <Link to="/">กลับหน้าแรก</Link>
      </div>
    </AccountShell>
  );
}
