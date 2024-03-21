import useDivisions from 'hooks/api/useDivisions';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';
import { IoMdInformationCircle } from 'react-icons/io';
import { ReasonsForVisitFormValues, UpdateReasonsForVisitProps } from './types';

export default function UpdateReasonsForVisit({
  currentReasonsForVisit,
  onCancel,
  onConfirm
}: UpdateReasonsForVisitProps) {
  const { desk } = useContext(DeskContext);
  const currentDivision = desk ? desk.divisionName : '';
  const [currentDivisionIsChecked, setCurrentDivisionIsChecked] = useState<boolean>(
    currentReasonsForVisit.includes(currentDivision)
  );
  const { divisions, error: getDivisionsError } = useDivisions();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ReasonsForVisitFormValues>();

  const onSubmit: SubmitHandler<ReasonsForVisitFormValues> = ({
    reasonForVisit: newReasonsForVisit
  }) => {
    onConfirm(newReasonsForVisit);
  };

  return (
    <>
      <h3 className="text-eerie_black mt-2 font-semibold">
        Update Reasons for Visit
      </h3>
      <p className="text-french_gray_2-500 mt-1 font-medium">
        This customer will placed in the corresponding waiting list(s) for the
        selected division(s).
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset
          name="reasonForVisit"
          className={`mt-4 rounded-md border p-3 ${
            errors.reasonForVisit ? 'border-red-600' : 'border-french_gray_2-600'
          }`}
        >
          <legend className="font-medium">Reasons for Visit</legend>
          {!divisions
            ? getDivisionsError
            : divisions.map(({ name: division }) => (
                <div
                  key={division}
                  className="mt-4 flex items-center first-of-type:mt-0"
                >
                  <input
                    type="checkbox"
                    id={division}
                    value={division}
                    {...register('reasonForVisit', {
                      required: 'Please select at least one'
                    })}
                    className="mr-4 inline-block h-5 w-5"
                    defaultChecked={currentReasonsForVisit.includes(division)}
                    onChange={(e) => {
                      // Call the onChange function from React Hook Form
                      register('reasonForVisit').onChange(e);

                      if (division === currentDivision) {
                        setCurrentDivisionIsChecked(e.target.checked);
                      }
                    }}
                  />
                  <label htmlFor={division}>{division}</label>
                </div>
              ))}
        </fieldset>
        {errors.reasonForVisit && (
          <span className="text-red-600">{errors.reasonForVisit.message}</span>
        )}
        {!currentDivisionIsChecked && (
          <div className="mt-4 flex items-center rounded-md border border-blue-500 p-2 text-sm text-blue-500">
            <IoMdInformationCircle size={32} />
            <span className="ml-2">
              Customer will no longer be manageable from {currentDivision} desks
            </span>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCancel}
            type="button"
            className={`border-french_gray_1-400 text-slate_gray hover:bg-platinum-800 hover:border-slate_gray
           mr-2 rounded-md border-2 px-3 py-1.5 font-medium`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`bg-onyx rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-10`}
          >
            Confirm
          </button>
        </div>
      </form>
    </>
  );
}
