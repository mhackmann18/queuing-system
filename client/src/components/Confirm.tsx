interface ConfirmProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmBtnStyles?: string;
  confirmBtnText?: string;
  confirmBtnDisabled?: boolean;
}

export default function Confirm({
  title,
  message,
  confirmBtnText = 'Confirm',
  confirmBtnStyles = 'bg-eerie_black text-white',
  onCancel,
  onConfirm,
  confirmBtnDisabled = true
}: ConfirmProps) {
  return (
    <div>
      <h3 className="text-eerie_black mt-2 font-semibold">{title}</h3>
      <h4 className="text-french_gray_2-500 mt-2 font-medium">{message}</h4>
      <div className="mt-8 flex justify-end">
        <button
          onClick={onCancel}
          type="button"
          className={`border-slate_gray text-slate_gray mr-2 rounded-md border-2 px-3 py-1.5 font-medium`}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          type="button"
          className={`rounded-md px-3 py-1.5 font-medium ${confirmBtnStyles} disabled:opacity-10`}
          disabled={confirmBtnDisabled}
        >
          {confirmBtnText}
        </button>
      </div>
    </div>
  );
}
