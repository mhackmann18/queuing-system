import { ReactEventHandler } from 'react';

interface FilterButtonComponent {
  active?: boolean;
  onClick: ReactEventHandler;
  text: string;
}

export default function FilterButton({
  text,
  onClick,
  active = false
}: FilterButtonComponent) {
  return (
    <button
      onClick={onClick}
      className={`border-french_gray_2-400 rounded-full border px-3 py-1 font-medium ${
        active ? 'bg-french_gray_2-400 text-white' : 'text-slate_gray'
      }`}
    >
      {text}
    </button>
  );
}
