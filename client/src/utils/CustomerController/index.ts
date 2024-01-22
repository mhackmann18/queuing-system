import { Customer, CustomerStatus, Station } from 'utils/types';
import { CustomerRaw } from './types';
import DummyApi from './DummyApi';

export default class CustomerController {
  station: Station;

  constructor(station: Station) {
    this.station = station;
  }

  async get({
    date,
    department,
    statuses
  }: {
    date: Date;
    department?: 'Motor Vehicle' | "Driver's License";
    statuses?: CustomerStatus[];
  }): Promise<{ data: Customer[] | null; error?: string }> {
    // The serving status only exists on the client. In the api it is translated to the current station.
    const { data, error } = await DummyApi.getCustomers({
      date,
      department,
      statuses:
        statuses && statuses.map((s) => (s === 'Serving' ? this.station : s))
    });

    if (!data) {
      return { data: null, error };
    }

    const rawCustomers: CustomerRaw[] = JSON.parse(data);

    const result = rawCustomers.map((c) => this.#sanitizeCustomer(c));

    return { data: result };
  }

  async delete(id: number): Promise<{ data: Customer | null; error?: string }> {
    const { data, error } = await DummyApi.deleteCustomer(id);

    if (!data) {
      return { data: null, error };
    }

    const rawCustomer: CustomerRaw = JSON.parse(data);

    const result = this.#sanitizeCustomer(rawCustomer);

    return { data: result };
  }

  async updateOne(
    id: number,
    {
      status,
      waitingListIndex,
      addCallTime
    }: {
      status?: CustomerStatus;
      waitingListIndex?: number;
      addCallTime?: Date;
    }
  ): Promise<{ data: Customer | null; error?: string }> {
    const { data, error } = await DummyApi.updateCustomer(id, {
      department:
        this.station[0] === 'M' ? 'Motor Vehicle' : "Driver's License",
      status: status === 'Serving' ? this.station : status,
      waitingListIndex,
      addCallTime
    });

    if (!data) {
      return { data: null, error };
    }

    const rawCustomer: CustomerRaw = JSON.parse(data);

    const result = this.#sanitizeCustomer(rawCustomer);

    return { data: result };
  }

  // OTHER

  async updateStatus(
    id: number,
    { status }: { status: CustomerStatus }
  ): Promise<{ data: Customer | null; error?: string }> {
    const res = await this.updateOne(id, { status });
    return res;
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

  static async callNext(): Promise<{ data: Customer | null; error?: string }> {
    return { data: `Call next customer to station ${stationId}` };
  }

  static async finishServing(id: number): Promise<FetchResponse> {
    return { data: `Finished serving customer with id ${id}` };
  }

  static async markNoShow(id: number): Promise<FetchResponse> {
    return { data: `Mark customer with id ${id} as No Show` };
  }

  #sanitizeCustomer(customer: CustomerRaw): Customer {
    const currentDepartment =
      this.station[0] === 'M' ? 'Motor Vehicle' : "Driver's License";

    const {
      id,
      motorVehicle,
      driversLicense,
      firstName,
      lastName,
      checkInTime
    } = customer;

    const reasonsForVisit = [];

    let sanitizedStatus = 'Waiting' as CustomerStatus;
    let callTimes;

    if (motorVehicle) {
      reasonsForVisit.push('Motor Vehicle');

      if (currentDepartment === 'Motor Vehicle') {
        const { status } = motorVehicle;

        callTimes = motorVehicle.callTimes;

        if (status === this.station) {
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
      }
    }

    if (driversLicense) {
      reasonsForVisit.push("Driver's License");

      if (currentDepartment === "Driver's License") {
        const { status } = driversLicense;

        callTimes = driversLicense.callTimes;

        if (status === this.station) {
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
}
