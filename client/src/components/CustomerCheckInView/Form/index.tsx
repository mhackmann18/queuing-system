import { useState } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import { CheckInFormProps, CheckInFormValues } from './types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FULL_NAME_MAX_LENGTH, REQUIRED_FIELD_ERROR } from 'utils/constants';
import SubmitBtn from 'components/Form/SubmitBtn';
import api from 'utils/api';
import useAuth from 'hooks/useAuth';
import useOffice from 'hooks/useOffice';

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
  const { token } = useAuth();
  const { id: officeId } = useOffice();

  const onSubmit: SubmitHandler<CheckInFormValues> = async ({
    fullName,
    reasonForVisit
  }) => {
    try {
      const response = await api.postCustomer(
        officeId,
        {
          fullName,
          divisionNames: reasonForVisit
        },
        token
      );

      onSubmitSuccess(response.data);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {/* Full Name */}
      <label htmlFor="fullName" className="mb-1 font-semibold">
        Full Name
      </label>
      <input
        type="text"
        id="fullName"
        {...register('fullName', {
          required: REQUIRED_FIELD_ERROR,
          maxLength: {
            value: FULL_NAME_MAX_LENGTH,
            message: `Maximum length of ${FULL_NAME_MAX_LENGTH} characters`
          }
        })}
        className={`rounded-md border p-2 ${
          errors.fullName ? 'border-red-600' : 'border-french_gray_2-600'
        }`}
      />
      {errors.fullName && (
        <span className="text-red-600">{errors.fullName.message}</span>
      )}

      {/* Reason for Visit */}
      <fieldset
        name="reasonForVisit"
        className={`mt-4 rounded-md border p-2 ${
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
      <SubmitBtn text="Check In" styles="mt-6" />

      {/* Submit Error */}
      {submitError && (
        <ErrorAlert
          error={submitError}
          close={() => setSubmitError('')}
          styles="mt-4"
        />
      )}
    </form>
  );
}
