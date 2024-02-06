import { IoCloseOutline } from 'react-icons/io5';
import { MdError } from 'react-icons/md';
import { ErrorProps } from './types';

export default function Error({ error, close, styles = '' }: ErrorProps) {
  return (
    <div
      className={`rounded-md border-2 border-red-500 bg-white p-3 shadow-md ${styles}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="inline-block text-red-500">
            <MdError size={26} />
          </span>
          <span className="mx-3">{error}</span>
        </div>
        <button
          type="button"
          className="hover:bg-antiflash_white hover:rounded-full"
          onClick={() => close()}
        >
          <IoCloseOutline size={22} />
        </button>
      </div>
    </div>
  );
}
