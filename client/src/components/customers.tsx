import { Customer } from './types';

const customers: Customer[] = [
  {
    id: 101,
    status: 'No Show',
    name: 'Christopher Pratt',
    checkInTime: new Date(),
    reasonsForVisit: ['Motor Vehicle'],
    callTimes: [new Date(), new Date(), new Date()]
  },
  {
    id: 102,
    status: 'Served',
    name: 'Robert Downey Jr.',
    checkInTime: new Date(),
    reasonsForVisit: ['Motor Vehicle'],
    callTimes: [new Date()]
  },
  {
    id: 103,
    status: 'Served',
    name: 'Christopher Evans',
    checkInTime: new Date(),
    reasonsForVisit: ['Motor Vehicle'],
    callTimes: [new Date()]
  },
  {
    id: 1,
    status: 'Serving',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()],
    reasonsForVisit: ['Motor Vehicle', "Driver's License"]
  },
  // {
  //   id: 2,
  //   status: 'At MV1',
  //   name: 'John Doe',
  //   checkInTime: new Date(),
  //   reasonsForVisit: ['Motor Vehicle'],

  //   callTimes: [new Date()]
  // },
  // {
  //   id: 21,
  //   status: 'At MV2',
  //   name: 'John Doe',
  //   checkInTime: new Date(),
  //   reasonsForVisit: ['Motor Vehicle'],

  //   callTimes: [new Date()]
  // },
  // {
  //   id: 22,
  //   status: 'At MV3',
  //   name: 'John Doe',
  //   checkInTime: new Date(),
  //   reasonsForVisit: ['Motor Vehicle'],

  //   callTimes: [new Date()]
  // },
  // {
  //   id: 23,
  //   status: 'At MV4',
  //   name: 'John Doe',
  //   checkInTime: new Date(),
  //   reasonsForVisit: ['Motor Vehicle'],

  //   callTimes: [new Date()]
  // },
  // {
  //   id: 25,
  //   status: 'At DL1',
  //   name: 'John Doe',
  //   checkInTime: new Date(),
  //   reasonsForVisit: ['Motor Vehicle'],

  //   callTimes: [new Date()]
  // },
  // {
  //   id: 24,
  //   status: 'At DL2',
  //   name: 'John Doe',
  //   checkInTime: new Date(),
  //   callTimes: [new Date()]
  // },
  {
    id: 3,
    status: 'Waiting',
    name: 'Jeremy Renner',
    checkInTime: new Date(),
    reasonsForVisit: ['Motor Vehicle'],
    callTimes: [new Date()]
  },
  {
    id: 4,
    status: 'Waiting',
    name: 'Scarlett Johansson',
    checkInTime: new Date(),
    reasonsForVisit: ['Motor Vehicle'],
    callTimes: [new Date()]
  }
];

export default customers;
