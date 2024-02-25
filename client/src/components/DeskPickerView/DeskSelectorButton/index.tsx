interface DeskSelectorButtonProps {
  deskNum: number;
  open: boolean;
  onClick?: () => void;
}

export default function DeskSelectorButton({
  deskNum,
  open,
  onClick
}: DeskSelectorButtonProps) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-lg border p-3  ${
        open
          ? 'border-french_gray_1 hover:bg-seasalt hover:border-french_gray_2'
          : 'border-platinum text-french_gray_1'
      }`}
      onClick={onClick}
    >
      <span>Desk {deskNum}</span>
      {!open && 'Occupied'}
    </button>
  );
}
