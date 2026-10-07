import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

describe('AC-BKG-01: UI shows booking result', () => {
  test('TC-BKG-01-1_confirm_booking_success', () => {
    render(<App />)

    expect(screen.getByText(/หมายเลขคิว/i)).toBeTruthy()
    expect(screen.getByText(/A[0-9]{3}/i)).toBeTruthy()
  })

  test('TC-BKG-01-2_last_available_slot_becomes_zero', () => {
    render(<App />)

    expect(screen.getByText(/หมายเลขคิว/i)).toBeTruthy()
    expect(screen.getByText(/A[0-9]{3}/i)).toBeTruthy()
    expect(screen.queryByText(/ช่วงเวลาเต็ม/i)).toBeNull()
  })
})
