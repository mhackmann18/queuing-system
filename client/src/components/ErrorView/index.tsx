import { RiErrorWarningLine } from 'react-icons/ri';

// export default function ErrorView({ error }: { error: string }) {
//   return (
//     <div className="fixed flex inset-0 items-center justify-center h-full">
//       <div className="text-onyx text-3xl font-bold">{error}</div>
//     </div>
//   );
// }

export default function ErrorView({ error }: { error: string }) {
  return (
    <div className="fixed inset-0 flex h-full items-center justify-center bg-gray-100">
      <div className="mx-auto flex max-w-sm items-center space-x-4 rounded-xl bg-white p-6 shadow-md">
        <div className="text-red-600">
          <RiErrorWarningLine size={34} />
        </div>
        <div>
          <div className="text-xl font-medium text-black">
            Oops! Something went wrong.
          </div>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    </div>
  );
}
