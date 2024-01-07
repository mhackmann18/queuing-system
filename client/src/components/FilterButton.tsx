import { ReactEventHandler } from 'react';
import { CustomerStatus } from './types';

interface FilterButtonComponent {
  active?: boolean;
  onClick: ReactEventHandler;
  status: CustomerStatus;
}

export default function FilterButton({
  status,
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
      {status}
    </button>
  );
}
