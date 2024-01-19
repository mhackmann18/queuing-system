import { sameDay } from 'utils/helpers';
import { Customer, CustomerStatus, Station } from 'utils/types';
import customersData from 'assets/dummyCustomers.json';
import { CustomerRaw } from './generateCustomers';

const currentStation = 'MV1';

function sanitizeCustomer(
  customer: CustomerRaw,
  station: Station
): Customer | null {
  const currentDepartment =
    station[0] === 'M' ? 'Motor Vehicle' : "Driver's License";

  const { id, motorVehicle, driversLicense, firstName, lastName, checkInTime } =
    customer;

  const reasonsForVisit = [];

  let sanitizedStatus = 'Waiting' as CustomerStatus;
  let callTimes;

  if (motorVehicle) {
    reasonsForVisit.push('Motor Vehicle');

    if (currentDepartment === 'Motor Vehicle') {
      const { status } = motorVehicle;

      callTimes = motorVehicle.callTimes;

      if (status === currentStation) {
        sanitizedStatus = 'Serving';
      } else if (
        status === 'Waiting' &&
        driversLicense &&
        ['DL1', 'DL2'].includes(driversLicense.status)
      ) {
        sanitizedStatus = driversLicense.status;
      } else {
        sanitizedStatus = status;
      }
    } else {
      return null;
    }
  }

  if (driversLicense) {
    reasonsForVisit.push("Driver's License");

    if (currentDepartment === "Driver's License") {
      const { status } = driversLicense;

      callTimes = driversLicense.callTimes;

      if (status === currentStation) {
        sanitizedStatus = 'Serving';
      } else if (
        status === 'Waiting' &&
        motorVehicle &&
        ['MV1', 'MV2', 'MV3', 'MV4'].includes(motorVehicle.status)
      ) {
        sanitizedStatus = motorVehicle.status;
      } else {
        sanitizedStatus = status;
      }
    } else {
      return null;
    }
  }

  return {
    id,
    name: `${firstName} ${lastName}`,
    status: sanitizedStatus,
    checkInTime: new Date(checkInTime),
    callTimes: callTimes!.map((t) => new Date(t)),
    reasonsForVisit
  };
}

interface FetchResponse {
  error?: string;
  data: Customer[] | string;
}

interface ApiResponse {
  data: CustomerRaw | CustomerRaw[] | null;
  error?: string;
}

interface OneCustomerResponse {
  data: CustomerRaw | null;
  error?: string;
}

export default class CustomerController {
  // CORE
  static async get({
    date
  }: {
    date: Date;
    department?: 'Motor Vehicle' | "Driver's License";
    statuses?: CustomerStatus[];
  }): Promise<{ data: Customer[] | null; error?: string }> {
    const customers = (customersData as CustomerRaw[]).map((c) =>
      sanitizeCustomer(c, currentStation)
    );
    customers.sort(
      (a, b) =>
        new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
    );
    const result = customers.filter((c) => sameDay(c.checkInTime, date));
    return { data: result };
  }

  static async deleteOne({
    id
  }: {
    id: number;
  }): Promise<{ data: Customer | null; error?: string }> {
    const customers = (customersData as CustomerRaw[]).map((c) =>
      sanitizeCustomer(c, currentStation)
    );
    return { data: customers.filter((c) => c.id !== id) };
  }

  static async updateOne(
    id: number,
    {
      status,
      waitingListIndex,
      addCallTime
    }: {
      status?: CustomerStatus;
      waitingListIndex?: number;
      addCallTime?: string; // Date string ISO 8601 format = "2024-01-19T21:03:27.178Z"
    }
  ): Promise<{ data: Customer | null; error?: string }> {}

  // OTHER

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

  static async init() {}
}
