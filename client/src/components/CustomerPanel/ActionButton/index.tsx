import { ReactEventHandler } from 'react';

export default function CustomerPanelActionButton({
  text,
  onClick
}: {
  text: string;
  onClick: ReactEventHandler;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-french_gray_1-700 text-onyx hover:bg-french_gray_1 mt-2 block w-full 
rounded-md p-3 text-left text-sm font-semibold"
    >
      {text}
    </button>
  );
}
