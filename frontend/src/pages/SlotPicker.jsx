import { useEffect, useState } from 'react'

import { api } from '../api/client.js'

// รองรับ FR-BKG-01 และ FR-BKG-06 โดยแสดงช่วงเวลาว่างและคำนวณจำนวนที่นั่งคงเหลือจาก API จำลอง
export default function SlotPicker() {
  const [packageCode, setPackageCode] = useState('STD')
  const [dateFrom, setDateFrom] = useState('2026-09-23')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadSlots = async () => {
      setLoading(true)
      try {
        const payload = await api.getSlots({ dateFrom, packageCode })
        if (active) {
          setSlots(Array.isArray(payload.slots) ? payload.slots : [])
        }
      } catch (error) {
        if (active) {
          setSlots([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSlots()
    return () => {
      active = false
    }
  }, [dateFrom, packageCode])

  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">เลือกแพ็กเกจและช่วงเวลา</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          แพ็กเกจ
          <select
            value={packageCode}
            onChange={(event) => setPackageCode(event.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2"
          >
            <option value="STD">Standard</option>
            <option value="PREMIUM">Premium</option>
            <option value="VIP">VIP</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          วันที่เริ่มต้น
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-slate-700">ช่วงเวลาที่ว่าง</p>

        {loading ? (
          <p className="text-slate-500">กำลังโหลดช่วงเวลา...</p>
        ) : slots.length === 0 ? (
          <p className="text-slate-500">ไม่มีช่วงเวลาว่างสำหรับแพ็กเกจนี้</p>
        ) : (
          <ul className="space-y-3">
            {slots.map((slot) => (
              <li
                key={`${slot.slot_date}-${slot.start_time}`}
                className="flex items-center justify-between rounded-lg border border-teal-100 bg-teal-50 px-4 py-3"
              >
                <span className="font-medium text-slate-800">
                  {slot.slot_date} · {slot.start_time}
                </span>
                <span className="rounded-full bg-white px-2 py-1 text-sm text-teal-700">
                  เหลือ {slot.remaining} ที่
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
