import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

const { loginWithGoogle } = vi.hoisted(() => ({ loginWithGoogle: vi.fn() }))

vi.mock('../src/firebase', () => ({
  useLoginWithGoogle: () => ({ loginWithGoogle }),
}))
vi.mock('/prodmkt-screenshot.png', () => ({
  default: 'prodmkt-screenshot.png',
}))

import { Login } from '../src/Login'

describe('Login', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the login heading', () => {
    render(<Login />)

    expect(
      screen.getByRole('heading', {
        name: 'Log in to setup your weather calendar',
      }),
    ).toBeTruthy()
  })

  it('calls loginWithGoogle when the Google button is clicked', () => {
    render(<Login />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Log in with Google' }),
    )

    expect(loginWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('renders the marketing bullet titles', () => {
    render(<Login />)

    expect(screen.getByText('Your Weather, Your Calendar')).toBeTruthy()
    expect(
      screen.getByText('Custom Forecasts for Your Location'),
    ).toBeTruthy()
    expect(screen.getByText('Add to Any Calendar')).toBeTruthy()
  })

  it('renders the marketing screenshot image', () => {
    const { container } = render(<Login />)

    const img = container.querySelector('img')

    expect(img?.getAttribute('src')).toContain('prodmkt-screenshot')
  })
})
