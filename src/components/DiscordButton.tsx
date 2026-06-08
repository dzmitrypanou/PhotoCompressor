import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface DiscordButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function DiscordButton({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: DiscordButtonProps) {
  return (
    <button className={`discord-button ${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
