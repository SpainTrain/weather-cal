import { useCallback, useState } from 'react'

export const useCopyToClipboard = (text: string) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    // set copied false after 3 seconds
    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }, [text])

  return { copied, copyToClipboard }
}
