import { useState, useCallback } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/utils/classNames'

interface CopyButtonProps {
  text: string
  className?: string
  label?: string
  size?: 'sm' | 'md'
}

export function CopyButton({ text, className, label, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [text])

  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-1',
        'text-xs font-medium transition-colors',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
        'hover:bg-[var(--color-surface-hover)]',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]',
        copied && 'text-[var(--color-success)]',
        className
      )}
    >
      {copied ? (
        <Check size={iconSize} aria-hidden="true" />
      ) : (
        <Copy size={iconSize} aria-hidden="true" />
      )}
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  )
}
