import SlotPicker from './pages/SlotPicker.jsx'

// โครงเริ่มต้นของรายวิชา: ยังไม่มีหน้าจอของ task ใด ๆ
// หน้าจอจริงจะถูกสร้างใน src/pages/ ตาม task ใน tasks.md ทีละหน้า
export default function App() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold text-teal-800">ระบบจองคิวตรวจสุขภาพ</h1>
      <SlotPicker />
    </main>
  )
}
