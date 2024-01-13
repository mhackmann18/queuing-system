import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';
import { useState } from 'react';
import { MdCalendarToday } from 'react-icons/md';

interface DateTogglerComponentProps {
  date: Date;
}

export default function DateToggler({ date }: DateTogglerComponentProps) {
  const [dated, setDated] = useState(date);
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'];

  const month = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mar',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
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
    <div className="text-outer_space flex align-middle">
      <button
        onClick={() => {
          dated.setDate(dated.getDate() - 1);
          setDated(new Date(dated));
        }}
        className="text-outer_space"
      >
        <FaChevronLeft />
      </button>
      <span className="text-slate_gray-500 mx-2 flex min-w-32 items-center justify-center text-lg font-medium">
        {getDateString()}
      </span>
      <button
        onClick={() => {
          dated.setDate(dated.getDate() + 1);
          setDated(new Date(dated));
        }}
        className="text-outer_space"
      >
        <FaChevronRight />
      </button>
      {/* TODO */}
      <button className="text-outer_space ml-4">
        <MdCalendarToday size={22} />
      </button>
    </div>
  );
}
