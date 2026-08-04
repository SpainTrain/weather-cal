import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'

import { useCopyToClipboard } from '../src/hooks'

describe('useCopyToClipboard', () => {
  const writeText = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    writeText.mockClear()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('starts with copied set to false', () => {
    const { result } = renderHook(() => useCopyToClipboard('hello world'))

    expect(result.current.copied).toBe(false)
  })

  it('writes the text to the clipboard and sets copied to true', () => {
    const { result } = renderHook(() => useCopyToClipboard('hello world'))

    act(() => {
      result.current.copyToClipboard()
    })

    expect(writeText).toHaveBeenCalledWith('hello world')
    expect(result.current.copied).toBe(true)
  })

  it('resets copied to false after 3 seconds', () => {
    const { result } = renderHook(() => useCopyToClipboard('hello world'))

    act(() => {
      result.current.copyToClipboard()
    })

    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.copied).toBe(false)
  })
})
