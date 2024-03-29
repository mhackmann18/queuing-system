import { ConfirmActionProps } from './types';

/**
 * Renders title in large bold font, and a message below the title in medium font.
 * Displays a cancel button and a confirm button below the message on the right.
 */
export default function ConfirmAction({
  title,
  message,
  confirmBtnText = 'Confirm',
  cancelBtnText = 'Cancel',
  onCancel,
  onConfirm,
  confirmBtnStyles = 'bg-onyx text-white hover:bg-outer_space',
  confirmBtnDisabled = false
}: ConfirmActionProps) {
  return (
    <>
      <h3 className="text-eerie_black mt-2 font-semibold">{title}</h3>
      <p className="text-french_gray_2-500 mt-2 font-medium">{message}</p>
      <div className="mt-8 flex justify-end">
        <button
          onClick={onCancel}
          type="button"
          className={`border-french_gray_1-400 text-slate_gray hover:bg-platinum-800 hover:border-slate_gray
           mr-2 rounded-md border-2 px-3 py-1.5 font-medium`}
        >
          {cancelBtnText}
        </button>
        <button
          onClick={onConfirm}
          type="button"
          className={`rounded-md px-3 py-1.5 font-medium disabled:opacity-10 ${confirmBtnStyles}`}
          disabled={confirmBtnDisabled}
        >
          {confirmBtnText}
        </button>
      </div>
    </>
  );
}
