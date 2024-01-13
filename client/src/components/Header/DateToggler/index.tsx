import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';
import { MdCalendarToday } from 'react-icons/md';
import { getDateString, sameDay } from 'utils/helpers';

interface DateTogglerComponentProps {
  date: Date;
  setDate: (date: Date) => void;
}

export default function DateToggler({
  date,
  setDate
}: DateTogglerComponentProps) {
  return (
    <div className="text-outer_space flex align-middle">
      {/* Previous Date */}
      <button
        onClick={() => {
          date.setDate(date.getDate() - 1);
          setDate(new Date(date));
        }}
        aria-label="Previous Date"
        className="text-outer_space"
        type="button"
      >
        <FaChevronLeft />
      </button>
      {/* Display Date */}
      <span className="text-slate_gray-500 mx-2 flex min-w-32 items-center justify-center text-lg font-medium">
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
          sameDay(date, new Date()) ? 'text-french_gray_1' : 'text-outer_space'
        }`}
        type="button"
      >
        <FaChevronRight />
      </button>
      {/* TODO */}
      <button className="text-outer_space ml-4" disabled={true}>
        <MdCalendarToday size={22} />
      </button>
    </div>
  );
}
