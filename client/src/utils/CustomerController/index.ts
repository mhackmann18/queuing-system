import { Customer, CustomerStatus, Division, StatusFilter } from 'utils/types';
import {
  CustomerRaw,
  CustomerControllerManyResult,
  CustomerControllerSingleResult,
  CustomerRawStatus
} from './types';
import DummyApi from './DummyApi';
import UserController from 'utils/UserController';

const division = 'Motor Vehicle';
const deskNum = 1;
const officeId = 1;

export default class CustomerController {
  /**
   * Gets an array of customers matching the specified filter criteria.
   *
   * @param {Object} filters - An object with filter properties.
   * @param {Date} filters.date - The date for filtering customers.
   * @param {Division} [filters.division] - The division for filtering customers.
   * @param {CustomerStatus[]} [filters.statuses] - An array of customer statuses for filtering.
   */
  async get(filters: {
    date: Date;
    division: Division;
    statuses?: StatusFilter[];
  }): Promise<CustomerControllerManyResult> {
    const { date, division, statuses } = filters;

    const sanitizedStatuses: CustomerRawStatus[] = [];

    if (statuses) {
      if (statuses.includes('Other Desks')) {
        const numDesks = await UserController.getNumDesks({ officeId, division });
        for (let i = 1; i <= numDesks; i++) {
          sanitizedStatuses.push(`Desk ${i}`);
        }
      } else if (statuses.includes('Serving')) {
        sanitizedStatuses.push(`Desk ${deskNum}`);
      }

      for (const status of statuses) {
        if (status !== 'Serving' && status !== 'Other Desks') {
          sanitizedStatuses.push(status);
        }
      }
    }

    // TODO: Make POST request /api/v1/customers
    const response = await DummyApi.getCustomers({
      date,
      division,
      statuses: sanitizedStatuses
    });

    const { data, error } = response;

    if (!data) {
      return { data: null, error: error };
    }

    const rawCustomers: CustomerRaw[] = JSON.parse(data);

    const sanitizedCustomers = rawCustomers
      .filter((c) => !!c.divisions[division])
      .map((c) => {
        const sc = this.#sanitizeCustomer(c, division)!;
        sc.status = `Desk ${deskNum}` !== sc.status ? sc.status : 'Serving';
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

    // TODO remove fallback dept
    const selectedCustomer = this.#sanitizeCustomer(rawCustomer, division);

    if (!selectedCustomer) {
      return {
        data: null,
        error:
          'getCustomerById response invalid. Customer does not belong to the current division.'
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

    // TODO remove fallback dept
    const result = this.#sanitizeCustomer(rawCustomer, division);

    if (!result) {
      return {
        data: null,
        error:
          'deleteCustomer response invalid. Customer does not belong to the current division.'
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
      division,
      status: status === 'Serving' ? `Desk ${deskNum}` : status,
      waitingListIndex,
      addCallTime
    });

    if (!data) {
      return { data: null, error };
    }

    // Updated customer data
    const rawCustomer: CustomerRaw = JSON.parse(data);

    const updatedCustomer = this.#sanitizeCustomer(rawCustomer, division);

    if (!updatedCustomer) {
      return {
        data: null,
        error:
          'updateCustomer response invalid. Customer does not belong to the current division.'
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
      division: division,
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

  #sanitizeCustomer(customer: CustomerRaw, division: Division): Customer | null {
    const { id, divisions, firstName, lastName, checkInTime } = customer;

    // Return null for customers that aren't relevant to the specified division
    if (!Object.keys(divisions).includes(division)) {
      return null;
    }

    // Get reasons for visit
    const reasonsForVisit: Division[] = Object.keys(divisions);

    // Get call times
    const callTimes = divisions[division].callTimes.map((t) => new Date(t));

    const status: CustomerStatus = divisions[division].status;

    let atOtherDivision: Division | undefined;

    for (const [dName, dData] of Object.entries(divisions)) {
      if (dName !== division && /^Desk \d+$/.test(dData.status)) {
        atOtherDivision = dName;
      }
    }

    return {
      id,
      name: `${firstName} ${lastName}`,
      status,
      checkInTime: new Date(checkInTime),
      callTimes,
      reasonsForVisit,
      atOtherDivision
    };
  }
}
