import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

import { CalendarDirections } from '../src/CalendarDirections'

const webcalUrl = 'webcal://calendars.raodix.com/forecast?calid=abc'
const googleCalAddByUrlLink =
  'https://calendar.google.com/calendar/u/0/r/settings/addbyurl'

describe('CalendarDirections', () => {
  const writeText = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    writeText.mockClear()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders a button for each calendar provider', () => {
    render(<CalendarDirections webcalUrl={webcalUrl} />)

    expect(
      screen.getByRole('button', { name: 'Google Calendar' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'iOS Apple Calendar' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Outlook Calendar' }),
    ).toBeTruthy()
  })

  it('shows no directions initially', () => {
    render(<CalendarDirections webcalUrl={webcalUrl} />)

    expect(screen.queryByText('Mobile')).toBeNull()
  })

  it('shows Google directions after clicking Google Calendar', () => {
    render(<CalendarDirections webcalUrl={webcalUrl} />)

    fireEvent.click(screen.getByRole('button', { name: 'Google Calendar' }))

    expect(screen.getByText('Mobile')).toBeTruthy()
    expect(screen.getByText('Desktop')).toBeTruthy()

    expect(screen.getAllByDisplayValue(webcalUrl)).toHaveLength(2)
    expect(screen.getAllByDisplayValue(googleCalAddByUrlLink)).toHaveLength(1)
  })

  it('collapses the directions when Google Calendar is clicked again', () => {
    render(<CalendarDirections webcalUrl={webcalUrl} />)

    const googleButton = screen.getByRole('button', { name: 'Google Calendar' })
    fireEvent.click(googleButton)
    expect(screen.getByText('Mobile')).toBeTruthy()

    fireEvent.click(googleButton)
    expect(screen.queryByText('Mobile')).toBeNull()
  })

  it('shows Apple directions after clicking iOS Apple Calendar', () => {
    render(<CalendarDirections webcalUrl={webcalUrl} />)

    fireEvent.click(screen.getByRole('button', { name: 'iOS Apple Calendar' }))

    expect(screen.getByText(/Add Subscription Calendar/)).toBeTruthy()
  })

  it('shows Outlook directions after clicking Outlook Calendar', () => {
    render(<CalendarDirections webcalUrl={webcalUrl} />)

    fireEvent.click(screen.getByRole('button', { name: 'Outlook Calendar' }))

    expect(screen.getByText(/From Internet/)).toBeTruthy()
  })

  it('copies the add-by-url link when the first Copy button is clicked', () => {
    render(<CalendarDirections webcalUrl={webcalUrl} />)

    fireEvent.click(screen.getByRole('button', { name: 'Google Calendar' }))

    const copyButtons = screen.getAllByRole('button', { name: 'Copy' })
    fireEvent.click(copyButtons[0])

    expect(screen.getAllByText('Copied').length).toBeGreaterThan(0)
    expect(writeText).toHaveBeenCalledWith(googleCalAddByUrlLink)
  })
})
