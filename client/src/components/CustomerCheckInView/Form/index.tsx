import { useState } from 'react';
import Error from 'components/Error';
import { CheckInFormProps, CheckInFormValues } from './types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FULL_NAME_MAX_LENGTH, REQUIRED_FIELD_ERROR } from 'utils/constants';
import SubmitBtn from 'components/Form/SubmitBtn';

const DUMMY_OFFICE_ID = '1056cc0c-c844-11ee-851b-4529fd7b70be';

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
    const res = await fetch(
      `http://localhost:5274/api/v1/offices/${DUMMY_OFFICE_ID}/customers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          divisionNames: reasonForVisit
        })
      }
    );

    if (res.status !== 200) {
      setSubmitError(
        "There's been a problem with the server. Please see a clerk for assistance."
      );
      return;
    }

    const { data, error } = await res.json();

    if (error) {
      setSubmitError(error);
    } else if (data) {
      onSubmitSuccess(data);
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
        <Error error={submitError} close={() => setSubmitError('')} styles="mt-4" />
      )}
    </form>
  );
}
