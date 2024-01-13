const get12HourTimeString = (date: Date) => {
  let dateString;
  const minutes = date.getMinutes();
  const hours = date.getHours();

  const minutesString = minutes < 10 ? `0${minutes}` : minutes;

  if (hours >= 12) {
    dateString = `${hours === 12 ? hours : hours % 12}:${minutesString} PM`;
  } else {
    dateString = `${hours === 0 ? '12' : hours}:${minutesString} AM`;
  }

  return dateString;
};

/******************** DATES ********************/

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

const sameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const getDateString = (date: Date): string => {
  if (sameDay(date, new Date())) {
    return 'Today';
  }

  return `${weekday[date.getDay()]}, ${
    month[date.getMonth()]
  } ${date.getDate()}`;
};

export { get12HourTimeString, sameDay, getDateString };
