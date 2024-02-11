interface DeskSelectorButtonProps {
  deskNum: number;
  open: boolean;
}

export default function DeskSelectorButton({
  deskNum,
  open
}: DeskSelectorButtonProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3  ${
        open
          ? 'border-french_gray_1 hover:bg-seasalt hover:border-french_gray_2'
          : 'border-platinum text-french_gray_1'
      }`}
    >
      <span>Desk {deskNum}</span>
      {!open && 'Occupied'}
    </div>
  );
}
