import { ManageCustomerActionButtonProps } from './types';

export default function ManageCustomerActionButton({
  name,
  onClick
}: ManageCustomerActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-french_gray_1-700 text-onyx hover:bg-french_gray_1 mt-2 block w-full 
rounded-md p-3 text-left text-sm font-semibold"
    >
      {name}
    </button>
  );
}
