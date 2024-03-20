interface UpdateReasonsForVisitProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Renders title in large bold font, and a message below the title in medium font.
 * Displays a cancel button and a confirm button below the message on the right.
 */
export default function UpdateReasonsForVisit({
  onCancel,
  onConfirm
}: UpdateReasonsForVisitProps) {
  return (
    <>
      <h3 className="text-eerie_black mt-2 font-semibold">
        Update Reasons for Visit
      </h3>
      <p className="text-french_gray_2-500 mt-2 font-medium">Updating </p>
      <div className="mt-8 flex justify-end">
        <button
          onClick={onCancel}
          type="button"
          className={`border-french_gray_1-400 text-slate_gray hover:bg-platinum-800 hover:border-slate_gray
           mr-2 rounded-md border-2 px-3 py-1.5 font-medium`}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          type="button"
          className={`rounded-md px-3 py-1.5 font-medium disabled:opacity-10`}
          // disabled={confirmBtnDisabled}
        >
          Confirm
        </button>
      </div>
    </>
  );
}
