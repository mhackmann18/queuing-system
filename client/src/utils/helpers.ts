import {
  StatusFilters,
  Customer,
  ManageCustomerAction,
  Division,
  StatusFilter,
  CustomerDto,
  CustomerStatus
} from './types';

const sortCustomers = (customers: Customer[]): Customer[] => {
  return customers.sort((a, b) => {
    const order = [['Served', 'No Show'], 'Serving', 'Waiting'];
    const aStatusIndex = order.findIndex((status) =>
      Array.isArray(status) ? status.includes(a.status) : status === a.status
    );
    const bStatusIndex = order.findIndex((status) =>
      Array.isArray(status) ? status.includes(b.status) : status === b.status
    );

    if (aStatusIndex !== bStatusIndex) {
      return aStatusIndex - bStatusIndex;
    } else {
      if (a.status === 'Served' || a.status === 'No Show') {
        return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
      } else if (a.status.startsWith('Desk')) {
        return parseInt(b.status.split(' ')[1]) - parseInt(a.status.split(' ')[1]);
      } else if (a.status === 'Waiting') {
        // return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
        return a.waitingListIndex! - b.waitingListIndex!;
      }
    }

    return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
  });
};

const sanitizeRawCustomer = (customer: CustomerDto, division: string): Customer => {
  const { id, fullName: name, checkInTime, divisions } = customer;

  let status = 'Waiting' as CustomerStatus;
  const timesCalled = [];
  const reasonsForVisit = [];
  let waitingListIndex: number | undefined;

  for (const d of divisions) {
    reasonsForVisit.push(d.name);
    if (d.name === division) {
      status = d.status;
      timesCalled.push(...d.timesCalled.map((d) => new Date(d)));
      waitingListIndex = d.waitingListIndex;
    }
  }

  return {
    id,
    status,
    name,
    checkInTime: new Date(checkInTime),
    timesCalled,
    reasonsForVisit,
    waitingListIndex
  };
};

const formatString = (input: string, lineLength: number) => {
  const words = input.split(' ');
  let line = '';
  let result = '';

  for (let i = 0; i < words.length; i++) {
    if ((line + words[i]).length <= lineLength) {
      line += words[i] + ' ';
    } else {
      result += line + '\n';
      line = words[i] + ' ';
    }
  }

  result += line;
  return result;
};

/**
 * @param {Customer[]} customers The customers to find the next selected customer from.
 * @returns Returns a customer with the highest priority status.
 */
const getNextSelectedCustomer = (customers: Customer[]): Customer => {
  const priorityOrder = ['Serving', 'Waiting', ['No Show', 'Served']];

  for (const status of priorityOrder) {
    if (Array.isArray(status)) {
      const customer = customers.find((customer) =>
        status.includes(customer.status)
      );
      if (customer) {
        return customer;
      }
    } else {
      const customer = customers.find((customer) => customer.status === status);
      if (customer) {
        return customer;
      }
    }
  }

  return customers[0];
};

/**
 * Returns a 2-3 character long string derived from the division and deskNum
 */
const getDeskName = (division: Division, deskNum: number) => {
  const divWords = division.split(' ');

  if (deskNum > 9 || divWords.length === 1) {
    return `${division[0]}${deskNum}`;
  } else {
    return `${divWords[0][0]}${divWords[divWords.length - 1][0]}${deskNum}`;
  }
};

const getNextElement = <T>(arr: T[], currentElement: T): T | undefined => {
  const currentIndex = arr.indexOf(currentElement);

  if (currentIndex !== -1) {
    const nextIndex = (currentIndex + 1) % arr.length;
    return arr[nextIndex];
  }

  return undefined;
};

const getAvailableActions = (customer: Customer): ManageCustomerAction[] => {
  let actions: ManageCustomerAction[] = [];

  switch (customer.status) {
    case 'Waiting':
      if (customer.timesCalled.length) {
        actions = ['Call to Station', 'Mark No Show', 'Delete'];
      } else {
        actions = ['Call to Station', 'Delete'];
      }
      break;
    case 'Serving':
      actions = [
        'Finish Serving',
        'Mark No Show',
        'Return to Waiting List',
        'Delete'
      ];
      break;
    case 'Served':
      actions = ['Delete'];
      break;
    case 'No Show':
      actions = ['Return to Waiting List', 'Delete'];
      break;
  }

  // Regardless of status, the only available action for customers from previous days is to delete them
  if (!sameDay(customer.checkInTime, new Date())) {
    actions = ['Delete'];
  }

  return actions;
};

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
  const statusesArr: StatusFilter[] = [];
  Object.entries(statuses).forEach(([status, active]) => {
    if (active) {
      const customerStatus = status as StatusFilter;
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
  formatTimePassed,
  sortDatesDescending,
  getAvailableActions,
  getNextElement,
  getDeskName,
  getNextSelectedCustomer,
  formatString,
  sanitizeRawCustomer,
  sortCustomers
};
