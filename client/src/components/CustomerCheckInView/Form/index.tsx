import { CheckInFormProps } from './types';

export default function CustomerCheckInViewForm({ divisions }: CheckInFormProps) {
  return (
    <form className="flex flex-col">
      {/* Full Name */}
      <label htmlFor="fullName" className="font-semibold">
        Full Name
      </label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        className="border-french_gray_2 mb-4 rounded-sm border p-2"
      />
      {/* Reason for Visit */}
      <label className="font-semibold" htmlFor="reasonForVisit">
        Reason for Visit
      </label>
      <p className="text-french_gray_2 mb-1">(Check all that apply)</p>
      {divisions.map((division, index) => (
        <div key={index} className="mt-4 flex items-center">
          <input
            type="checkbox"
            id={division}
            name={division}
            value={division}
            className="mr-4 inline-block h-5 w-5"
          />
          <label htmlFor={division}>{division}</label>
        </div>
      ))}
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
