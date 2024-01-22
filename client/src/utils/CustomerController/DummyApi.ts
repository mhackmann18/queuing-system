import { sameDay } from 'utils/helpers';
import {
  CustomerRaw,
  CustomerRawStatus,
  DLCustomerRawStatus,
  MVCustomerRawStatus
} from './types';

// Function to generate a unique ID
const generateUniqueId = (() => {
  let id = 0;
  return () => id++;
})();

// Function to generate a random date within a range of hours
const getRandomDateWithinHoursRange = (
  startHour: number,
  endHour: number
): Date => {
  const currentDate = new Date();
  const randomDate = new Date(currentDate);

  randomDate.setHours(
    startHour + Math.floor(Math.random() * (endHour - startHour))
  );
  randomDate.setMinutes(Math.floor(Math.random() * 60));

  return randomDate;
};

function getRandomStatus(): 'Waiting' | 'Served' | 'No Show' {
  const randomValue = Math.random() * 100;

  if (randomValue < 60) {
    return 'Waiting';
  } else if (randomValue < 90) {
    return 'Served';
  } else {
    return 'No Show';
  }
}

// Function to generate a random customer fitting the specified type
class CustomerGenerator {
  motorVehicleStationsRemaining: MVCustomerRawStatus[];
  driversLicenseStationsRemaing: DLCustomerRawStatus[];

  constructor() {
    // motorVehicle.status cannot be 'MV1' | 'MV2' | 'MV3' | 'MV4' if driversLicense.status is 'DL1'| 'DL2'
    this.motorVehicleStationsRemaining = ['MV1', 'MV2', 'MV3', 'MV4'];
    // driversLicense.status cannot be 'DL1'| 'DL2' if motorVehicle.status is 'MV1' | 'MV2' | 'MV3' | 'MV4'
    this.driversLicenseStationsRemaing = ['DL1', 'DL2'];
  }

  getNext(): CustomerRaw {
    const id = generateUniqueId();
    const checkInTime = getRandomDateWithinHoursRange(7, new Date().getHours()); // Restricted to 9 AM to 6 PM

    // Determine whether customer is MV, DL, or both
    const isMotorVehicleCustomer = Math.random() < 0.8; // 80% chance of having 'motorVehicle' status
    let isDriversLicenseCustomer;
    if (isMotorVehicleCustomer) {
      isDriversLicenseCustomer = Math.random() < 0.2; // 20% chance of also being DL customer
    } else {
      isDriversLicenseCustomer = true; // All customers that aren't MV are DL
    }

    // Determine customer's MV status
    const motorVehicleStatus = isMotorVehicleCustomer
      ? this.motorVehicleStationsRemaining.shift() || getRandomStatus()
      : undefined;

    // Determine customer's DL status
    let driversLicenseStatus;
    if (isDriversLicenseCustomer) {
      if (
        isMotorVehicleCustomer &&
        ['MV1', 'MV2', 'MV3', 'MV4'].includes(motorVehicleStatus!)
      ) {
        driversLicenseStatus = getRandomStatus();
      } else {
        driversLicenseStatus =
          this.driversLicenseStationsRemaing.shift() || getRandomStatus();
      }
    }

    const callTimes =
      motorVehicleStatus === 'Waiting' || Math.random() < 0.7 // 70% chance for 'Waiting' status to not have callTimes
        ? []
        : [
            getRandomDateWithinHoursRange(
              checkInTime.getHours(),
              20
            ).toISOString(),
            getRandomDateWithinHoursRange(
              checkInTime.getHours(),
              20
            ).toISOString()
          ];

    return {
      id,
      ...(motorVehicleStatus! && {
        motorVehicle: { status: motorVehicleStatus, callTimes }
      }),
      ...(driversLicenseStatus && {
        driversLicense: { status: driversLicenseStatus, callTimes }
      }),
      firstName: `FirstName${id}`,
      lastName: `LastName${id}`,
      checkInTime: checkInTime.toISOString()
    };
  }
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

export default class DummyApi {
  static init() {
    const c = new CustomerGenerator();

    // Generate an array of 20 random customers
    const customers: CustomerRaw[] = Array.from({ length: 50 }, () =>
      c.getNext()
    );

    const sortedCustomers = getSortedCustomers(customers);

    // Convert the array to JSON
    const customersJSON = JSON.stringify(sortedCustomers, null, 2);

    localStorage.setItem('customers', customersJSON);
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
              (c.driversLicense &&
                statuses.includes(c.driversLicense.status)) ||
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

    const indexOfCustomerToUpdate = rawCustomers.findIndex((c) => c.id === id);

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
      if (addCallTime) {
        rawCustomers[indexOfCustomerToUpdate][deptKey]!.callTimes.push(
          addCallTime.toISOString()
        );
      }
      if (status) {
        rawCustomers[indexOfCustomerToUpdate][deptKey]!.status = status;
      }
      if (waitingListIndex) {
        // find insertion point
      }
    }

    const updatedCustomer = rawCustomers[indexOfCustomerToUpdate];

    const sortedRawCustomers = getSortedCustomers(rawCustomers);

    localStorage.setItem('customers', JSON.stringify(sortedRawCustomers));

    return { data: JSON.stringify(updatedCustomer) };
  }
}

// ONLY GIVES MV CUSTOMERS
function getSortedCustomers(customers: CustomerRaw[]) {
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
    (a, b) =>
      new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
  );

  // Sort waiting customers by check in time
  waitingCustomers.sort(
    (a, b) =>
      new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
  );

  return [...servedCustomers, ...servingCustomers, ...waitingCustomers];
}
