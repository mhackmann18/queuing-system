import { Customer, CustomerStatus, Station } from 'utils/types';
import { CustomerRaw } from './types';
import DummyApi from './DummyApi';

interface CustomerControllerSingleResult {
  data: Customer | null;
  error?: string;
}

// For these two types, there should only be an error when the data is null.
// Likewise, the data should only be null when there's an error.

interface CustomerControllerManyResult {
  data: Customer[] | null;
  error?: string;
}

export default class CustomerController {
  station: Station;

  constructor(station: Station) {
    this.station = station;
  }

  /******************/
  /* CORE FUNCTIONS */
  /******************/

  /**
   * Gets an array of customers matching the specified filter criteria.
   *
   * @param {Object} filters - An object with filter properties.
   * @param {Date} filters.date - The date for filtering customers.
   * @param {('Motor Vehicle' | "Driver's License")} [filters.department] - The department for filtering customers.
   * @param {CustomerStatus[]} [filters.statuses] - An array of customer statuses for filtering.
   */
  async get({
    date,
    department,
    statuses
  }: {
    date: Date;
    department?: 'Motor Vehicle' | "Driver's License";
    statuses?: CustomerStatus[];
  }): Promise<CustomerControllerManyResult> {
    // Make API POST request /api/v1/customers
    const response = await DummyApi.getCustomers({
      date,
      department,
      statuses:
        // The 'Serving' status only exists on the client
        statuses && statuses.map((s) => (s === 'Serving' ? this.station : s))
    });

    const { data, error } = response;

    if (!data) {
      return { data: null, error: error };
    }

    const rawCustomers: CustomerRaw[] = JSON.parse(data);

    const sanitizedCustomers = rawCustomers.map((c) =>
      this.#sanitizeCustomer(c)
    );

    return { data: sanitizedCustomers };
  }

  /**
   * Deletes a customer with the specified id.
   *
   * @param {number} id - The id of the customer to delete.
   */
  async delete(id: number): Promise<CustomerControllerSingleResult> {
    // Make API delete reuest to /api/v1/customers/id
    const response = await DummyApi.deleteCustomer(id);
    const { data, error } = response;

    if (!data) {
      return { data: null, error };
    }

    const rawCustomer: CustomerRaw = JSON.parse(data);

    const result = this.#sanitizeCustomer(rawCustomer);

    return { data: result };
  }

  /**
   * Updates the properties of a customer.
   *
   * @param {number} id - The id of the customer to update.
   * @param {Object} updatedProperties - The customer properties to update.
   * @param {CustomerStatus} [updatedProperties.status] - Updated status.
   * @param {number} [updatedProperties.waitingListIndex] - Updated position in the waiting list.
   * @param {Date} [updatedProperties.addCallTime] - New call time to add to existing call times.
   */
  async update(
    id: number,
    updatedProperties: {
      status?: CustomerStatus;
      waitingListIndex?: number;
      addCallTime?: Date;
    }
  ): Promise<CustomerControllerSingleResult> {
    if (!Object.keys(updatedProperties).length) {
      return {
        data: null,
        error: 'You must provide at least one property to update'
      };
    }

    const { status, waitingListIndex, addCallTime } = updatedProperties;

    if (waitingListIndex && status && status !== 'Waiting') {
      return {
        data: null,
        error:
          "A customer cannot have a waitingListIndex if their status isn't equal to 'Waiting'"
      };
    }

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

  /*********************/
  /* DERIVED FUNCTIONS */
  /*********************/

  async updateWaitingListIndex({
    id,
    index
  }: {
    id: number;
    index: number;
  }): Promise<CustomerControllerSingleResult> {
    const res = await this.update(id, {
      waitingListIndex: index
    });

    return res;
  }

  async callToStation(id: number): Promise<CustomerControllerSingleResult> {
    const res = await this.update(id, {
      status: 'Serving',
      addCallTime: new Date()
    });
    return res;
  }

  async callNext(): Promise<{ data: Customer | null; error?: string }> {
    // Get customers in the WL
    const res = await this.get({
      date: new Date(),
      department:
        this.station[0] === 'M' ? 'Motor Vehicle' : "Driver's License",
      statuses: ['Waiting']
    });

    if (res.error || !res.data) {
      return { data: null, error: res.error };
    }

    if (!res.data.length) {
      return {
        data: null,
        error: 'There are no customers in the waiting list'
      };
    }

    // Get id of first customer in WL
    const idOfCustomerToCall = res.data[0].id;

    const result = await this.callToStation(idOfCustomerToCall);

    return result;
  }

  async finishServing(id: number): Promise<CustomerControllerSingleResult> {
    const res = await this.update(id, {
      status: 'Served'
    });
    return res;
  }

  async markNoShow(id: number): Promise<CustomerControllerSingleResult> {
    const res = await this.update(id, {
      status: 'No Show'
    });
    return res;
  }

  /********************/
  /* HELPER FUNCTIONS */
  /********************/

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
