import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Error from 'components/Error';
import TextInputLabel from 'components/Form/TextInputLabel';
import SubmitBtn from 'components/Form/SubmitBtn';
import TextInput from 'components/Form/TextInput';
import useAuth from 'hooks/useAuth';

interface FormGeneralUserProps {
  onSubmitSuccess: (data: unknown) => void;
}

type FormData = {
  username: string;
  password: string;
};

export default function FormGeneralUser({ onSubmitSuccess }: FormGeneralUserProps) {
  const [submitError, setSubmitError] = useState<string>('');
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>();

  const onSubmit = async ({ username, password }: FormData) => {
    login({ username, password });
    console.log(onSubmitSuccess);
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      {/* Username */}
      <TextInputLabel htmlFor="username" styles="mt-2 mb-1" />
      <TextInput
        type="text"
        name="username"
        register={register}
        error={errors.username?.message}
        required={true}
      />

      {/* Password */}
      <div className="mb-1 mt-3 flex items-end">
        <TextInputLabel htmlFor="password" styles="grow" />
        <span className="text-french_gray_2-400 text-sm">Forgot your password?</span>
      </div>
      <TextInput
        type="password"
        name="password"
        register={register}
        error={errors.password?.message}
        required={true}
      />

      {/* Submit Button */}
      <SubmitBtn text="Sign In" styles="mt-4" />

      {/* Submit Error */}
      {submitError && (
        <Error error={submitError} close={() => setSubmitError('')} styles="mt-4" />
      )}
    </form>
  );
}
