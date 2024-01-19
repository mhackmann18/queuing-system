import { sameDay } from 'utils/helpers';
import { Customer, CustomerStatus, Station } from 'utils/types';
import customersData from 'assets/dummyCustomers.json';

const currentStation = 'MV1';

type CStatus =
  | 'Waiting'
  | 'Served'
  | 'No Show'
  | 'MV1'
  | 'MV2'
  | 'MV3'
  | 'MV4'
  | 'DL1'
  | 'DL2';

interface C {
  id: number;
  status: {
    motorVehicle?: Exclude<CStatus, 'DL1' | 'DL2'>;
    driversLicense?: Exclude<CStatus, 'MV1' | 'MV2' | 'MV3' | 'MV4'>;
  };
  firstName: string;
  lastName: string;
  checkInTime: string;
  callTimes: string[];
}

function sanitizeCustomer(customer: C, station: Station): Customer {
  const department = station[0] === 'M' ? 'Motor Vehicle' : "Driver's License";

  const {
    id,
    status: { motorVehicle, driversLicense },
    firstName,
    lastName,
    checkInTime,
    callTimes
  } = customer;

  const reasonsForVisit = [];
  let sanitizedStatus: CustomerStatus = motorVehicle || 'DL1';

  if (motorVehicle) {
    reasonsForVisit.push('Motor Vehicle');

    if (department === 'Motor Vehicle') {
      if (motorVehicle === station) {
        sanitizedStatus = 'Serving';
      } else {
        sanitizedStatus = motorVehicle;
      }
    }
  }

  if (driversLicense) {
    reasonsForVisit.push("Driver's License");

    if (department === "Driver's License") {
      if (driversLicense === station) {
        sanitizedStatus = 'Serving';
      } else {
        sanitizedStatus = driversLicense;
      }
    }
  }

  return {
    id,
    name: `${firstName} ${lastName}`,
    status: sanitizedStatus,
    checkInTime: new Date(checkInTime),
    callTimes: callTimes.map((t) => new Date(t)),
    reasonsForVisit
  };
}

interface FetchResponse {
  error?: string;
  data: Customer[] | string;
}

export default class CustomerController {
  static async get({
    date
  }: {
    date: Date;
  }): Promise<{ error?: string; data: Customer[] }> {
    const customers = (customersData as C[]).map((c) =>
      sanitizeCustomer(c, currentStation)
    );
    customers.sort(
      (a, b) =>
        new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
    );
    const result = customers.filter((c) => sameDay(c.checkInTime, date));
    return { data: result };
  }

  static async deleteOne({ id }: { id: number }): Promise<FetchResponse> {
    const customers = (customersData as C[]).map((c) =>
      sanitizeCustomer(c, currentStation)
    );
    return { data: customers.filter((c) => c.id !== id) };
  }

  static async updateStatus(
    id: number,
    { status }: { status: CustomerStatus }
  ): Promise<FetchResponse> {
    return { data: `Updated customer with id ${id} to status '${status}'` };
  }

  static async updateWaitingListIndex({
    customerId,
    index
  }: {
    customerId: number;
    index: number;
  }) {
    return { error: false, data: [customerId, index] };
  }

  static async callToStation(id: number): Promise<FetchResponse> {
    return { data: `Begin serving customer with id ${id}` };
  }

  static async callNext(stationId: string): Promise<FetchResponse> {
    return { data: `Call next customer to station ${stationId}` };
  }

  static async finishServing(id: number): Promise<FetchResponse> {
    return { data: `Finished serving customer with id ${id}` };
  }

  static async markNoShow(id: number): Promise<FetchResponse> {
    return { data: `Mark customer with id ${id} as No Show` };
  }
}
