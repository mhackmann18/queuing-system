import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';
// import { CiCalendar } from 'react-icons/ci';
import { useState } from 'react';

interface DateTogglerProps {
  date: Date;
}

export default function DateToggler({ date }: DateTogglerProps) {
  const [dated, setDated] = useState(date);
  const weekday = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  const month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  function sameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  const getDateString = (): string => {
    if (sameDay(dated, new Date())) {
      return 'Today';
    }

    return `${weekday[dated.getDay()]}, ${
      month[dated.getMonth()]
    } ${dated.getDate()}`;
  };

  console.log('rerender');

  return (
    <div className="flex align-middle">
      <button
        onClick={() => {
          dated.setDate(dated.getDate() - 1);
          setDated(new Date(dated));
        }}
      >
        <FaChevronLeft />
      </button>
      <span className="mx-2 flex items-center">{getDateString()}</span>
      <button
        onClick={() => {
          dated.setDate(dated.getDate() + 1);
          setDated(new Date(dated));
        }}
      >
        <FaChevronRight />
      </button>
      {/* TODO */}
      {/* <button>
        <CiCalendar size={28} />
      </button> */}
    </div>
  );
}
