import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import SlotPicker from '../pages/SlotPicker.jsx'

const { mockedApi } = vi.hoisted(() => ({
  mockedApi: {
    getSlots: async ({ packageCode, dateFrom }) => {
      if (packageCode === 'PREMIUM') {
        return {
          slots: [
            { slot_date: dateFrom, start_time: '09:00', remaining: 3 },
            { slot_date: dateFrom, start_time: '10:30', remaining: 2 },
          ],
        }
      }

      return {
        slots: [
          { slot_date: dateFrom, start_time: '09:00', remaining: 5 },
          { slot_date: dateFrom, start_time: '11:00', remaining: 4 },
        ],
      }
    },
  },
}))

vi.mock('../api/client.js', () => ({
  api: mockedApi,
}))

test('T-09: แสดงช่วงเวลาว่างตามแพ็กเกจ และโหลดใหม่เมื่อผู้ใช้เปลี่ยนแพ็กเกจ', async () => {
  render(<SlotPicker />)

  expect(await screen.findByText(/เลือกแพ็กเกจและช่วงเวลา/i)).toBeTruthy()
  expect(await screen.findByText(/09:00/i)).toBeTruthy()
  expect(screen.getByText(/เหลือ 5 ที่/i)).toBeTruthy()

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PREMIUM' } })

  await waitFor(() => {
    expect(screen.getByText(/เหลือ 3 ที่/i)).toBeTruthy()
  })

  expect(screen.getByText(/10:30/i)).toBeTruthy()
})
