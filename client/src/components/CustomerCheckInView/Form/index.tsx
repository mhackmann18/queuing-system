import { CheckInFormProps, CheckInFormValues } from './types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FULL_NAME_MAX_LENGTH } from 'utils/constants';

export default function CustomerCheckInViewForm({ divisions }: CheckInFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckInFormValues>();

  const onSubmit: SubmitHandler<CheckInFormValues> = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {/* Full Name */}
      <label htmlFor="fullName" className="ml-2 font-semibold">
        Full Name
      </label>
      <input
        type="text"
        id="fullName"
        {...register('fullName', {
          required: true,
          maxLength: FULL_NAME_MAX_LENGTH
        })}
        className={`rounded-sm border p-2 ${
          errors.fullName ? 'border-red-600' : 'border-french_gray_2'
        }`}
      />
      {errors.fullName && (
        <span className="text-red-600">This field is required</span>
      )}

      {/* Reason for Visit */}
      <fieldset
        name="reasonForVisit"
        className={`mt-4 rounded-sm border p-2 ${
          errors.reasonForVisit ? 'border-red-600' : 'border-french_gray_2'
        }`}
      >
        <legend className="font-semibold">Reason for Visit</legend>
        {/* <p className="text-french_gray_2 mb-1">(Check all that apply)</p> */}
        {divisions.map((division, index) => (
          <div key={index} className="mt-4 flex items-center first-of-type:mt-0">
            <input
              type="checkbox"
              id={division}
              value={division}
              {...register('reasonForVisit', { required: true })}
              className="mr-4 inline-block h-5 w-5"
            />
            <label htmlFor={division}>{division}</label>
          </div>
        ))}
      </fieldset>
      {errors.reasonForVisit && (
        <span className="text-red-600">Please select at least one</span>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-onyx hover:bg-outer_space mt-6 rounded-md px-3
      py-2.5 font-medium text-white"
      >
        Check In
      </button>
    </form>
  );
}
