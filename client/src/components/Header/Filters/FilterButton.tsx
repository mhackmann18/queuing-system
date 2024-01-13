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
      type="button"
      className={`rounded-full border px-3 py-1 font-medium ${
        active
          ? `bg-french_gray_2-400 border-french_gray_2-400 hover:bg-french_gray_2-300 
          hover:border-french_gray_2-300 text-white`
          : 'text-slate_gray border-french_gray_1-500 hover:bg-platinum-800 hover:border-slate_gray'
      }`}
    >
      {text}
    </button>
  );
}
