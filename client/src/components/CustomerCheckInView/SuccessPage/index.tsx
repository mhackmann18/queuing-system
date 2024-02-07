import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { SuccessPageProps } from './types';

export default function SuccessPage({ onDoneBtnClick }: SuccessPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex max-w-80 flex-col items-center">
        <IoIosCheckmarkCircleOutline size={180} className="text-green-500" />
        <h1 className="mb-4 mt-2 text-4xl font-medium text-green-500">
          You&apos;re all set!
        </h1>
        <p className="text-french_gray_2 text-medium mb-6 text-center text-xl">
          Please take a seat and wait for your name to be called. Thank you.
        </p>
        <button
          onClick={onDoneBtnClick}
          className="rounded-md bg-green-500 px-6 py-3 text-xl font-semibold text-white"
        >
          Done
        </button>
      </div>
    </div>
  );
}
