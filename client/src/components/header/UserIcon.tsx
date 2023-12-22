import { MouseEventHandler } from 'react'

interface UserIconComponent {
  text: string
  color: string
  onClick: MouseEventHandler<HTMLButtonElement>
}

// TODO: Make responsive
export default function UserIcon({ text, color, onClick }: UserIconComponent) {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-12 rounded-full ${color} flex items-center justify-center`}
    >
      <span className="font-semibold text-white">{text}</span>
    </button>
  )
}
