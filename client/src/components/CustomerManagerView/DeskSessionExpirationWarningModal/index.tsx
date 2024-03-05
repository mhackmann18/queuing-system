/* eslint-disable tailwindcss/migration-from-tailwind-2 */
export default function DeskSessionExpirationWarningModal({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md">
        <div className="rounded-lg bg-white p-4">
          <p className="mb-2 text-center">
            Your desk session will expire in less than one minute. Doing nothing will
            cause you to be removed from the desk.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onCancel}
              className="bg-onyx hover:bg-outer_space mr-1 flex items-center rounded-md px-3 py-2 text-white"
            >
              Leave desk
            </button>
            <button
              onClick={onConfirm}
              className="bg-onyx hover:bg-outer_space flex items-center rounded-md px-3 py-2 text-white"
            >
              Stay at desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
