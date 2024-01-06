import { CustomerStatus } from './types';

interface FilterButtonComponent {
  active?: boolean;
  status: CustomerStatus;
}

export default function FilterButton({
  status,
  active = false
}: FilterButtonComponent) {
  return (
    <button
      className={`border-french_gray_2-400 rounded-full border-2 px-3 py-1 font-medium ${
        active ? 'bg-french_gray_2-400 text-white' : 'text-slate_gray'
      }`}
    >
      {status}
    </button>
  );
}
