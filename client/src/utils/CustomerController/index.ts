import { Customer, CustomerStatus, Department, Station } from 'utils/types';
import {
  CustomerRaw,
  CustomerControllerManyResult,
  CustomerControllerSingleResult
} from './types';
import DummyApi from './DummyApi';
import { getDeptFromStation } from 'utils/helpers';

export default class CustomerController {
  station: Station;
  department: Department;

  constructor(station: Station) {
    DummyApi.init();
    this.station = station;
    this.department = getDeptFromStation(station);
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
  async get(filters: {
    date: Date;
    department: 'Motor Vehicle' | "Driver's License";
    statuses?: CustomerStatus[];
  }): Promise<CustomerControllerManyResult> {
    const { date, department, statuses } = filters;

    // TODO: Make POST request /api/v1/customers
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

    const sanitizedCustomers = rawCustomers
      .filter((c) => fromDepartment(c, department))
      .map((c) => {
        const sc = this.#sanitizeCustomer(c, department)!;
        sc.status = this.station !== sc.status ? sc.status : 'Serving';
        return sc;
      });

    return { data: sanitizedCustomers };
  }

  /**
   * Gets a single customer by id.
   *
   * @param {number} id - An object with filter properties.
   */
  async getOne(id: number): Promise<CustomerControllerSingleResult> {
    // TODO: Make GET request /api/v1/customers/${id}
    const response = await DummyApi.getCustomerById(id);

    const { data, error } = response;

    if (!data) {
      return { data: null, error: error };
    }

    const rawCustomer = JSON.parse(data);

    const selectedCustomer = this.#sanitizeCustomer(rawCustomer, this.department);

    if (!selectedCustomer) {
      return {
        data: null,
        error:
          'getCustomerById response invalid. Customer does not belong to the current department.'
      };
    }

    return { data: selectedCustomer };
  }

  /**
   * Deletes a customer with the specified id.
   *
   * @param {number} id - The id of the customer to delete.
   */
  async delete(id: number): Promise<CustomerControllerSingleResult> {
    if (!id || id <= 0) {
      return {
        data: null,
        error: 'Must provide a positive, non-zero integer for id argument'
      };
    }

    // TODO: Make DELETE request to /api/v1/customers/id
    const response = await DummyApi.deleteCustomer(id);
    const { data, error } = response;

    if (!data) {
      return { data: null, error };
    }

    // Deleted customer data
    const rawCustomer: CustomerRaw = JSON.parse(data);

    const result = this.#sanitizeCustomer(rawCustomer, this.department);

    if (!result) {
      return {
        data: null,
        error:
          'deleteCustomer response invalid. Customer does not belong to the current department.'
      };
    }

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
    const { status, waitingListIndex, addCallTime } = updatedProperties;

    // Error checks
    if (!Object.keys(updatedProperties).length) {
      return {
        data: null,
        error: 'You must provide at least one property to update'
      };
    }

    if (waitingListIndex && status && status !== 'Waiting') {
      return {
        data: null,
        error:
          "A customer cannot have a waitingListIndex if their status isn't equal to 'Waiting'"
      };
    }

    // TODO: Make PUT request to /api/v1/customers/id
    const { data, error } = await DummyApi.updateCustomer(id, {
      department: getDeptFromStation(this.station),
      status: status === 'Serving' ? this.station : status,
      waitingListIndex,
      addCallTime
    });

    if (!data) {
      return { data: null, error };
    }

    // Updated customer data
    const rawCustomer: CustomerRaw = JSON.parse(data);

    const updatedCustomer = this.#sanitizeCustomer(rawCustomer, this.department);

    if (!updatedCustomer) {
      return {
        data: null,
        error:
          'updateCustomer response invalid. Customer does not belong to the current department.'
      };
    }

    return { data: updatedCustomer };
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

  async callNext(): Promise<CustomerControllerSingleResult> {
    // Get customers in the WL
    const res = await this.get({
      date: new Date(),
      department: getDeptFromStation(this.station),
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

  #sanitizeCustomer(customer: CustomerRaw, department: Department): Customer | null {
    const { id, motorVehicle, driversLicense, firstName, lastName, checkInTime } =
      customer;

    // Return null for customers that aren't relevant to the specified department
    if (department === 'Motor Vehicle' && !motorVehicle) {
      return null;
    } else if (department === "Driver's License" && !driversLicense) {
      return null;
    }

    // Get reasons for visit
    const reasonsForVisit: Department[] = [];
    motorVehicle && reasonsForVisit.push('Motor Vehicle');
    driversLicense && reasonsForVisit.push("Driver's License");

    // Get call times
    const callTimes = getSanitizedCallTimes(customer, department);
    if (!callTimes) {
      return null;
    }

    let sanitizedStatus: CustomerStatus =
      department === 'Motor Vehicle' ? motorVehicle!.status : driversLicense!.status;

    let atOtherDept: Department | undefined;

    if (department === 'Motor Vehicle') {
      sanitizedStatus = motorVehicle!.status;

      if (
        motorVehicle!.status === 'Waiting' &&
        driversLicense &&
        ['DL1', 'DL2'].includes(driversLicense.status)
      ) {
        atOtherDept = "Driver's License";
      }
    }

    if (department === "Driver's License") {
      sanitizedStatus = driversLicense!.status;

      if (
        driversLicense!.status === 'Waiting' &&
        motorVehicle &&
        ['MV1', 'MV2', 'MV3', 'MV4'].includes(motorVehicle.status)
      ) {
        atOtherDept = 'Motor Vehicle';
      }
    }

    return {
      id,
      name: `${firstName} ${lastName}`,
      status: sanitizedStatus,
      checkInTime: new Date(checkInTime),
      callTimes,
      reasonsForVisit,
      atOtherDept
    };
  }
}

function getSanitizedCallTimes(
  customer: CustomerRaw,
  department: Department
): Date[] | null {
  const { motorVehicle, driversLicense } = customer;
  let callTimes = null;

  if (department === 'Motor Vehicle' && motorVehicle) {
    callTimes = motorVehicle.callTimes.map((t) => new Date(t));
  } else if (department === "Driver's License" && driversLicense) {
    callTimes = driversLicense.callTimes.map((t) => new Date(t));
  }

  return callTimes;
}

function fromDepartment(customer: CustomerRaw, department: Department): boolean {
  let belongs = false;
  if (department === 'Motor Vehicle' && customer.motorVehicle) {
    belongs = true;
  } else if (department === "Driver's License" && customer.driversLicense) {
    belongs = true;
  }
  return belongs;
}
