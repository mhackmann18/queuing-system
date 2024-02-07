import { useState } from 'react';
import Error from 'components/Error';
import { CheckInFormProps, CheckInFormValues } from './types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FULL_NAME_MAX_LENGTH } from 'utils/constants';
import CustomerController from 'utils/CustomerController';

const DUMMY_OFFICE_ID = 1;

export default function CustomerCheckInViewForm({
  divisions,
  onSubmitSuccess
}: CheckInFormProps) {
  const [submitError, setSubmitError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckInFormValues>();

  const onSubmit: SubmitHandler<CheckInFormValues> = async ({
    fullName,
    reasonForVisit
  }) => {
    const { error, data } = await CustomerController.create({
      fullName,
      divisions: reasonForVisit,
      officeId: DUMMY_OFFICE_ID
    });

    if (error) {
      setSubmitError(error);
    } else if (data) {
      onSubmitSuccess(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {/* Full Name */}
      <label htmlFor="fullName" className="font-semibold">
        Full Name
      </label>
      <input
        type="text"
        id="fullName"
        {...register('fullName', {
          required: { value: true, message: 'This field is required' },
          maxLength: {
            value: FULL_NAME_MAX_LENGTH,
            message: `Maximum length of ${FULL_NAME_MAX_LENGTH} characters`
          }
        })}
        className={`rounded-sm border p-1.5 ${
          errors.fullName ? 'border-red-600' : 'border-french_gray_2-600'
        }`}
      />
      {errors.fullName && (
        <span className="text-red-600">{errors.fullName.message}</span>
      )}

      {/* Reason for Visit */}
      <fieldset
        name="reasonForVisit"
        className={`mt-4 rounded-sm border p-2 ${
          errors.reasonForVisit ? 'border-red-600' : 'border-french_gray_2-600'
        }`}
      >
        <legend className="font-semibold">Reason for Visit</legend>
        {divisions.map((division, index) => (
          <div key={index} className="mt-4 flex items-center first-of-type:mt-0">
            <input
              type="checkbox"
              id={division}
              value={division}
              {...register('reasonForVisit', {
                required: 'Please select at least one'
              })}
              className="mr-4 inline-block h-5 w-5"
            />
            <label htmlFor={division}>{division}</label>
          </div>
        ))}
      </fieldset>
      {errors.reasonForVisit && (
        <span className="text-red-600">{errors.reasonForVisit.message}</span>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-onyx hover:bg-outer_space mt-6 rounded-md px-3
      py-2.5 font-medium text-white"
      >
        Check In
      </button>

      {/* Submit Error */}
      {submitError && (
        <Error error={submitError} close={() => setSubmitError('')} styles="mt-4" />
      )}
    </form>
  );
}
