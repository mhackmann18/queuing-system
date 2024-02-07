import { UseFormRegister } from 'react-hook-form';
import { REQUIRED_FIELD_ERROR } from 'utils/constants';

interface TextInputProps {
  type: 'text' | 'password';
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  error?: string;
  required?: boolean;
}

export default function TextInput({
  type,
  name,
  register,
  error,
  required
}: TextInputProps) {
  return (
    <>
      <input
        type={type}
        id={name}
        {...register(name, { required: required && REQUIRED_FIELD_ERROR })}
        className={`rounded-md border p-2 ${
          error ? 'border-red-600' : 'border-french_gray_2-600'
        }`}
      />

      {error && <span className="text-red-600">{error}</span>}
    </>
  );
}
