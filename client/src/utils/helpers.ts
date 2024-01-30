import { CustomerStatus, Department, Station, StatusFilters } from './types';

const sortDatesDescending = (dates: Date[]): Date[] => {
  return dates.slice().sort((a, b) => b.getTime() - a.getTime());
};

const formatTimePassed = (startDate: Date, endDate: Date): string => {
  const diffInMilliseconds = Math.abs(+endDate - +startDate);
  const minutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const timeParts: string[] = [];

  if (days > 0) {
    timeParts.push(`${days} day${days > 1 ? 's' : ''}`);
  }

  if (hours % 24 > 0) {
    timeParts.push(`${hours % 24} hr${hours % 24 > 1 ? 's' : ''}`);
  }

  if (minutes % 60 > 0) {
    timeParts.push(`${minutes % 60} min`);
  }

  return timeParts.length > 0 ? timeParts.join(' ') : '0 min';
};

const getDeptFromStation = (station: Station): Department =>
  station[0] === 'M' ? 'Motor Vehicle' : "Driver's License";

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

  return `${weekday[date.getDay()]}, ${month[date.getMonth()]} ${date.getDate()}`;
};

const statusFiltersToArr = (statuses: StatusFilters) => {
  const statusesArr: CustomerStatus[] = [];
  Object.entries(statuses).forEach(([status, active]) => {
    if (active) {
      const customerStatus = status as CustomerStatus;
      statusesArr.push(customerStatus);
    }
  });
  return statusesArr;
};

export {
  get12HourTimeString,
  sameDay,
  getDateString,
  statusFiltersToArr,
  getDeptFromStation,
  formatTimePassed,
  sortDatesDescending
};
