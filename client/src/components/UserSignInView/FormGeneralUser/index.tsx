import React from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  username: string;
  password: string;
};

export default function FormGeneralUser() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // Handle form submission here
    console.log(data);
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="username" className="mb-1 mt-2 font-semibold">
        Username
      </label>
      <input
        type="text"
        id="username"
        {...register('username', { required: 'Username is required' })}
        className={`rounded-md border p-2 ${
          errors.username ? 'border-red-600' : 'border-french_gray_2-600'
        }`}
      />
      {errors.username && (
        <span className="text-red-600">{errors.username.message}</span>
      )}

      <div className="mb-1 mt-3 flex items-end">
        <label htmlFor="password" className="grow font-semibold">
          Password
        </label>
        <span className="text-french_gray_2-400 text-sm">Forgot your password?</span>
      </div>
      <input
        type="password"
        id="password"
        {...register('password', { required: 'Password is required' })}
        className={`rounded-md border p-2 ${
          errors.password ? 'border-red-600' : 'border-french_gray_2-600'
        }`}
      />
      {errors.password && (
        <span className="text-red-600">{errors.password.message}</span>
      )}

      <button
        type="submit"
        className="bg-onyx hover:bg-outer_space mt-4 rounded-md px-3
      py-2.5 font-medium text-white"
      >
        Sign In
      </button>
    </form>
  );
}
