import * as Icons from 'lucide-react'

type IconName = keyof typeof Icons

interface IconProps {
  name: IconName
  size?: number
}

export function LIcon({ name, size = 16 }: IconProps) {
  const LucideIcon = Icons[name] as any

  return <LucideIcon size={size} />
}
