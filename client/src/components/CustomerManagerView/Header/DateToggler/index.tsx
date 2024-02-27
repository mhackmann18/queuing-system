import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';
import { MdCalendarToday } from 'react-icons/md';
import { getDateString, sameDay } from 'utils/helpers';
import { DateTogglerProps } from './types';

export default function DateToggler({
  date,
  setDate,
  setError,
  containerStyles = ''
}: DateTogglerProps) {
  return (
    <div className={`flex align-middle ${containerStyles}`}>
      {/* Previous Date */}
      <button
        onClick={() => {
          date.setDate(date.getDate() - 1);
          setDate(new Date(date));
        }}
        aria-label="Previous Date"
        className="text-outer_space hover:text-slate_gray"
        type="button"
      >
        <FaChevronLeft size={15} />
      </button>
      {/* Display Date */}
      <span className="mx-2 flex min-w-32 items-center justify-center  font-medium">
        {getDateString(date)}
      </span>
      {/* Next Date */}
      <button
        onClick={() => {
          // Can't change date to future date
          if (!sameDay(date, new Date())) {
            date.setDate(date.getDate() + 1);
            setDate(new Date(date));
          }
        }}
        aria-label="Next Date"
        disabled={!!sameDay(date, new Date())}
        className={`${
          sameDay(date, new Date())
            ? 'text-french_gray_1'
            : 'text-outer_space hover:text-slate_gray'
        }`}
        type="button"
      >
        <FaChevronRight size={15} />
      </button>
      {/* TODO */}
      <button
        className="text-outer_space hover:text-slate_gray ml-4"
        onClick={() =>
          setError(
            "This feature hasn't been added yet. Will open a calendar where clicking a date will show customers for that date"
          )
        }
      >
        <MdCalendarToday size={20} />
      </button>
    </div>
  );
}
