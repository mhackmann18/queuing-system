import { ReactEventHandler } from 'react';

export default function ActionButton({
  text,
  onClick
}: {
  text: string;
  onClick: ReactEventHandler;
}) {
  return (
    <button
      onClick={onClick}
      className=" bg-french_gray_1-700 text-onyx mt-2 block w-full rounded-md border 
px-3 py-2 text-left text-sm font-semibold"
    >
      {text}
    </button>
  );
}
