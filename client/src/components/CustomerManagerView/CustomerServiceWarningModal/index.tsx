/* eslint-disable tailwindcss/migration-from-tailwind-2 */
export default function CustomerServiceWarningModal({
  close
}: {
  close: () => void;
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md">
        <div className="rounded-lg bg-white p-4">
          <p className="mb-2 text-center">
            You are currently serving a customer. Please finish serving the customer
            before leaving the page.
          </p>
          <div className="flex justify-end">
            <button
              onClick={close}
              className="bg-onyx hover:bg-outer_space flex items-center rounded-md px-3 py-2 text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
