import { FilterButtonComponent } from './types';

export default function FilterButton({
  text,
  onClick,
  disabled = false,
  active = false
}: FilterButtonComponent) {
  let styles =
    'text-slate_gray border-french_gray_1-500 hover:bg-platinum-800 hover:border-slate_gray';

  // Determine relevant styles
  if (disabled) {
    styles = 'text-french_gray_1 border-platinum';
  } else if (active) {
    styles =
      'bg-french_gray_2-400 border-french_gray_2-400 hover:bg-french_gray_2-300 hover:border-french_gray_2-300 text-white';
  }

  return (
    <button
      onClick={onClick}
      type="button"
      disabled={disabled}
      className={`rounded-full border px-3 py-1 font-medium ${styles}`}
    >
      {text}
    </button>
  );
}
