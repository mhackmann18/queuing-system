interface UserTypeButtonProps {
  type: string;
  labelText: string;
  message: string;
  onClick: () => void;
  selected: boolean;
}

export default function UserTypeButton({
  type,
  labelText,
  message,
  onClick,
  selected
}: UserTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`mb-2 w-full rounded-md border p-4 ${
        selected ? 'bg-seasalt border-french_gray_2' : ''
      }`}
    >
      <div className="mb-1.5 flex items-center">
        <input
          type="radio"
          id={type}
          name="user-type"
          value={type}
          checked={selected}
          className="mr-4 inline-block h-5 w-5"
          onChange={() => null}
        />
        <label htmlFor={type} className="align-top text-lg font-medium">
          {labelText}
        </label>
      </div>
      <p className="font-md text-slate_gray text-left">{message}</p>
    </button>
  );
}
