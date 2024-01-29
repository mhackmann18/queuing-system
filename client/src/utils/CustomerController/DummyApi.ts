import { sameDay } from 'utils/helpers';
import {
  CustomerRaw,
  CustomerRawGenericStatus,
  CustomerRawStatus,
  DLCustomerRawStatus,
  MVCustomerRawStatus
} from './types';

function getFinalCheckInTime() {
  const finalCheckInTime = new Date();
  finalCheckInTime.setHours(18); // Office closes at 6 PM

  finalCheckInTime.setMinutes(finalCheckInTime.getMinutes() - 20);
  // Final customer checks in 20 minutes before closing

  return finalCheckInTime;
}

function getOpeningTime() {
  const currentDate = new Date();
  currentDate.setHours(7);
  return currentDate;
}

function generateEvenlySpacedDates(
  firstCheckInTime: Date,
  finalCheckInTime: Date,
  x: number
): Date[] {
  const timeDiff = finalCheckInTime.getTime() - firstCheckInTime.getTime();
  const interval = timeDiff / (x - 1);

  const dates: Date[] = [];

  for (let i = 0; i < x; i++) {
    const newDate = new Date(firstCheckInTime.getTime() + i * interval);
    dates.push(newDate);
  }

  return dates;
}

export type ApiResponse = Promise<{
  data: string | null;
  error?: string;
}>;

export interface GetCustomersBody {
  date: Date;
  department?: 'Motor Vehicle' | "Driver's License";
  statuses?: CustomerRawStatus[];
}

export interface UpdateCustomerBody {
  department: 'Motor Vehicle' | "Driver's License";
  addCallTime?: Date;
  waitingListIndex?: number;
  status?: CustomerRawStatus;
}

function getRandomDateWithinXHours(date: Date, hours: number) {
  const oneHourInMilliseconds = 60 * 60 * 1000; // 1 hour in milliseconds

  const randomTimestamp =
    date.getTime() + Math.random() * oneHourInMilliseconds * hours;

  return new Date(randomTimestamp);
}

function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateRandomDates(startDate: Date, endDate: Date, numberOfDates: number) {
  const randomDates = [];

  for (let i = 0; i < numberOfDates; i++) {
    const randomTimestamp =
      startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime());
    const randomDate = new Date(randomTimestamp);
    randomDates.push(randomDate);
  }

  // Sort the array in descending order (most recent dates first)
  randomDates.sort((a, b) => b.getTime() - a.getTime());

  return randomDates;
}

function getCallTimes(checkInTime: Date, status: CustomerRawStatus): Date[] {
  const callTimes: Date[] = [];

  if (['MV1', 'MV2', 'MV3', 'MV4', 'DL1', 'DL2'].includes(status)) {
    callTimes.push(getRandomDateWithinXHours(checkInTime, 0.3));
  } else if (status === 'No Show') {
    const cutoff = getRandomDateWithinXHours(checkInTime, 2);
    const randomNumber = getRandomNumber(2, 5);
    callTimes.push(...generateRandomDates(checkInTime, cutoff, randomNumber));
  } else if (status === 'Served') {
    callTimes.push(getRandomDateWithinXHours(checkInTime, 1));
  }

  return callTimes;
}

function getDayBackCheckInTime(x: number) {
  const currentDate = getOpeningTime();
  currentDate.setDate(currentDate.getDate() - x);
  return currentDate;
}

function getDayBackFinalCheckInTime(dayBack: number) {
  const finalCheckInTime = getDayBackCheckInTime(dayBack);
  finalCheckInTime.setHours(18); // Office closes at 6 PM

  finalCheckInTime.setMinutes(finalCheckInTime.getMinutes() - 20);
  // Final customer checks in 20 minutes before closing

  return finalCheckInTime;
}

export default class DummyApi {
  static #getOldCustomers(dayBack: number) {
    const numCustomers = 40;
    const customers: CustomerRaw[] = [];
    const checkInTimes = generateEvenlySpacedDates(
      getDayBackCheckInTime(dayBack),
      getDayBackFinalCheckInTime(dayBack),
      numCustomers
    );
    let i = 0;
    for (i; i < numCustomers / 2; i++) {
      const id = dayBack * 100 + i + 1;

      const checkInTime = checkInTimes[i];

      const status = Math.random() < 0.8 ? 'Served' : 'No Show';

      customers.push({
        id,
        checkInTime: checkInTime.toISOString(),
        firstName: `FirstName${id}`,
        lastName: `LastName${id}`,
        motorVehicle: {
          status,
          callTimes: getCallTimes(checkInTime, status).map((t) => t.toISOString())
        }
      });
    }
    for (i; i < numCustomers; i++) {
      const id = dayBack * 100 + i + 1;

      const checkInTime = checkInTimes[i];

      const status = Math.random() < 0.8 ? 'Served' : 'No Show';

      customers.push({
        id,
        checkInTime: checkInTime.toISOString(),
        firstName: `FirstName${id}`,
        lastName: `LastName${id}`,
        driversLicense: {
          status: status,
          callTimes: getCallTimes(checkInTime, status).map((t) => t.toISOString())
        }
      });
    }
    return customers;
  }

  // Place an array of 100 customers into local storage
  static init() {
    const customers: CustomerRaw[] = [];
    const checkInTimes: Date[] = generateEvenlySpacedDates(
      getOpeningTime(),
      getFinalCheckInTime(),
      100
    );
    const mvRemainingStations: MVCustomerRawStatus[] = ['MV1', 'MV2', 'MV3', 'MV4'];
    const dlRemainingStations: DLCustomerRawStatus[] = ['DL1', 'DL2'];

    for (let i = 0; i < 100; i++) {
      const id = i + 1;
      const checkInTime = checkInTimes[i];

      // 70% of customers will be MV
      const isMotorVehicle = Math.random() < 0.7;
      // 10% of MV customers will be DL in addition to MV. If not MV then guarunteed to be DL
      const isDriversLicense = isMotorVehicle ? Math.random() < 0.1 : true;

      let mvStatus: MVCustomerRawStatus | undefined;
      let dlStatus: DLCustomerRawStatus | undefined;

      // Determine customer's statuses
      if (i < 35) {
        // The first 35 customers have an 80% chance of being served and 20% for no show
        if (isMotorVehicle && isDriversLicense) {
          mvStatus = Math.random() < 0.8 ? 'Served' : 'No Show';
          dlStatus = mvStatus as CustomerRawGenericStatus;
        } else if (isMotorVehicle) {
          mvStatus = Math.random() < 0.8 ? 'Served' : 'No Show';
        } else {
          dlStatus = Math.random() < 0.8 ? 'Served' : 'No Show';
        }
      } else if (isMotorVehicle && mvRemainingStations.length) {
        mvStatus = mvRemainingStations.shift()!;
        if (isDriversLicense) dlStatus = 'Waiting';
      } else if (isDriversLicense && dlRemainingStations.length) {
        dlStatus = dlRemainingStations.shift()!;
        if (isMotorVehicle) mvStatus = 'Waiting';
      } else {
        if (isMotorVehicle) {
          mvStatus = 'Waiting';
        }
        if (isDriversLicense) {
          dlStatus = 'Waiting';
        }
      }

      customers.push({
        id,
        checkInTime: checkInTime.toISOString(),
        firstName: `FirstName${i + 1}`,
        lastName: `LastName${i + 1}`,
        ...{
          motorVehicle: mvStatus! && {
            status: mvStatus,
            callTimes: getCallTimes(checkInTime, mvStatus).map((t) =>
              t.toISOString()
            )
          }
        },
        ...{
          driversLicense: dlStatus && {
            status: dlStatus,
            callTimes: getCallTimes(checkInTime, dlStatus).map((t) =>
              t.toISOString()
            )
          }
        }
      });
    }
    customers.push(...DummyApi.#getOldCustomers(2));
    customers.push(...DummyApi.#getOldCustomers(1));

    localStorage.setItem('customers', JSON.stringify(customers));
  }

  static async getCustomers({
    date,
    department,
    statuses
  }: GetCustomersBody): ApiResponse {
    const customers = localStorage.getItem('customers');

    if (!customers) {
      return { data: null, error: 'The database has not yet been initialized' };
    }

    const rawCustomers: CustomerRaw[] = JSON.parse(customers);

    const result: CustomerRaw[] = [];

    for (const c of rawCustomers) {
      if (sameDay(new Date(c.checkInTime), date)) {
        if (department) {
          // Get customers for specific department

          if (department === 'Motor Vehicle' && c.motorVehicle) {
            if (statuses) {
              if (statuses.includes(c.motorVehicle.status)) {
                result.push(c);
              }
            } else {
              result.push(c);
            }
          } else if (department === "Driver's License" && c.driversLicense) {
            if (statuses) {
              if (statuses.includes(c.driversLicense.status)) {
                result.push(c);
              }
            } else {
              result.push(c);
            }
          }
        } else {
          // Get customers from all departments
          if (statuses) {
            if (
              (c.driversLicense && statuses.includes(c.driversLicense.status)) ||
              (c.motorVehicle && statuses.includes(c.motorVehicle.status))
            ) {
              result.push(c);
            }
          } else {
            result.push(c);
          }
        }
      }
    }

    return { data: JSON.stringify(result) };
  }

  static async getCustomerById(id: number): ApiResponse {
    const customers = localStorage.getItem('customers');

    if (!customers) {
      return { data: null, error: 'The database has not yet been initialized' };
    }

    const rawCustomers: CustomerRaw[] = JSON.parse(customers);

    const customer = rawCustomers.find((c) => c.id === id);

    if (!customer) {
      return { data: null, error: `No customer exists with id ${id}` };
    }

    return { data: JSON.stringify(customer) };
  }

  static async deleteCustomer(id: number): ApiResponse {
    const customers = localStorage.getItem('customers');

    if (!customers) {
      return { data: null, error: 'The database has not yet been initialized' };
    }

    const rawCustomers: CustomerRaw[] = JSON.parse(customers);

    const indexOfCustomerToDelete = rawCustomers.findIndex((c) => c.id === id);

    if (indexOfCustomerToDelete === -1) {
      return { data: null, error: `No customer exists with id: ${id}` };
    }

    const [deletedCustomer] = rawCustomers.splice(indexOfCustomerToDelete, 1);

    localStorage.setItem('customers', JSON.stringify(rawCustomers));

    return { data: JSON.stringify(deletedCustomer) };
  }

  static async updateCustomer(
    id: number,
    { addCallTime, status, waitingListIndex, department }: UpdateCustomerBody
  ): ApiResponse {
    const customers = localStorage.getItem('customers');

    if (!customers) {
      return { data: null, error: 'The database has not yet been initialized' };
    }

    const rawCustomers: CustomerRaw[] = JSON.parse(customers);

    let indexOfCustomerToUpdate = rawCustomers.findIndex((c) => c.id === id);

    if (indexOfCustomerToUpdate === -1) {
      return { data: null, error: `No customer exists with id: ${id}` };
    }

    const deptKey =
      department === 'Motor Vehicle' ? 'motorVehicle' : 'driversLicense';

    if (!rawCustomers[indexOfCustomerToUpdate][deptKey]) {
      return {
        data: null,
        error: `No customer exists in the department: ${department} with id: ${id}`
      };
    } else {
      // Call time is most recent, it should appear at beginning of array
      if (addCallTime) {
        rawCustomers[indexOfCustomerToUpdate][deptKey]!.callTimes.splice(
          0,
          0,
          addCallTime.toISOString()
        );
      }
      if (waitingListIndex || waitingListIndex === 0) {
        const customerToUpdate = rawCustomers[indexOfCustomerToUpdate];

        // Find the index in customers to place the updated customer at
        const insertIndex = findIndexOfWaitingListIndex(
          rawCustomers,
          department,
          waitingListIndex
        );

        if (insertIndex === -1) {
          return { data: null, error: 'waitingListIndex is out of bounds' };
        }

        let deleteIndex = indexOfCustomerToUpdate;

        // Insert updated customer
        rawCustomers.splice(insertIndex, 0, customerToUpdate);
        rawCustomers[insertIndex][deptKey]!.status = 'Waiting';

        // If inserting the updated customer causes the old one to be pushed back in the array,
        // the index of the old one needs to be updated
        if (insertIndex <= deleteIndex) {
          deleteIndex += 1;
        }

        // Remove old customer
        rawCustomers.splice(deleteIndex, 1);

        // DOUBLE CHECK
        if (deleteIndex <= insertIndex) {
          indexOfCustomerToUpdate = insertIndex - 1;
        } else {
          indexOfCustomerToUpdate = insertIndex;
        }
      }
      if (status && !waitingListIndex) {
        rawCustomers[indexOfCustomerToUpdate][deptKey]!.status = status;

        if (['MV1', 'MV2', 'MV3', 'MV4', 'DL1', 'DL2'].includes(status)) {
          //
          const [c] = rawCustomers.splice(indexOfCustomerToUpdate, 1);

          for (let i = 0; i < rawCustomers.length; i++) {
            if (
              rawCustomers[i][deptKey] &&
              rawCustomers[i][deptKey]!.status &&
              ['MV1', 'MV2', 'MV3', 'MV4', 'DL1', 'DL2'].includes(
                rawCustomers[i][deptKey]!.status
              )
            ) {
              rawCustomers.splice(i, 0, c);
              indexOfCustomerToUpdate = i;
              break;
            }
          }
        }
      }
    }

    const updatedCustomer = rawCustomers[indexOfCustomerToUpdate];

    localStorage.setItem('customers', JSON.stringify(rawCustomers));

    return { data: JSON.stringify(updatedCustomer) };
  }
}

function findIndexOfWaitingListIndex(
  customers: CustomerRaw[], // Array of all customers
  department: 'Motor Vehicle' | "Driver's License", // The department for which the waiting list index is being found
  waitingListIndex: number // The waiting list index for which the overall index should be found
): number {
  let indexOfWaitingListPosition = -1;
  const deptProp =
    department === 'Motor Vehicle' ? 'motorVehicle' : 'driversLicense';

  let currentWaitingListIndex = -1;
  let indexOfLastWaitingCustomer = -1;
  for (let i = 0; i < customers.length; i++) {
    const c = customers[i];

    if (c[deptProp] && c[deptProp]?.status === 'Waiting') {
      currentWaitingListIndex += 1;
      indexOfLastWaitingCustomer = i;
    }

    if (currentWaitingListIndex === waitingListIndex) {
      indexOfWaitingListPosition = i;
      break;
    }
  }

  // Edge case for placing customer at end of wl
  if (currentWaitingListIndex + 1 === waitingListIndex) {
    return indexOfLastWaitingCustomer + 1;
  }

  return indexOfWaitingListPosition;
}

// ONLY GIVES MV CUSTOMERS
export function getSortedCustomers(customers: CustomerRaw[]) {
  const servedCustomers = [];
  const servingCustomers = [];
  const waitingCustomers = [];

  for (const c of customers) {
    const { motorVehicle } = c;
    if (motorVehicle) {
      if (['No Show', 'Served'].includes(motorVehicle.status)) {
        servedCustomers.push(c);
      } else if (['MV1', 'MV2', 'MV3', 'MV4'].includes(motorVehicle.status)) {
        servingCustomers.push(c);
      } else if (motorVehicle.status === 'Waiting') {
        waitingCustomers.push(c);
      }
    }
  }

  // Sort served customers by check in time
  servedCustomers.sort(
    (a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
  );

  // Sort waiting customers by check in time
  waitingCustomers.sort(
    (a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
  );

  return [...servedCustomers, ...servingCustomers, ...waitingCustomers];
}
