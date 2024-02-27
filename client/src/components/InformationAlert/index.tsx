import { IoCloseOutline } from 'react-icons/io5';
import { IoMdInformationCircle } from 'react-icons/io';

interface InformationAlertProps {
  message: string;
  close: () => void;
  styles?: string;
}

export default function InformationAlert({
  message,
  close,
  styles = ''
}: InformationAlertProps) {
  return (
    <div
      className={`rounded-md border-2 border-blue-500 bg-white p-3 shadow-md ${styles}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="inline-block text-blue-500">
            <IoMdInformationCircle size={26} />
          </span>
          <span className="mx-3">{message}</span>
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
