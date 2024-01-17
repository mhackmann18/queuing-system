import customers from './customers';
import { sameDay } from 'utils/helpers';
import { Customer, CustomerStatus } from 'utils/types';

interface GetCustomerRequestBody {
  date: Date;
}

interface FetchResponse {
  error?: string;
  data: Customer[] | string;
}

export default class CustomerController {
  static async get({
    date
  }: GetCustomerRequestBody): Promise<{ error?: string; data: Customer[] }> {
    const result = customers.filter((c) => sameDay(c.checkInTime, date));
    return { data: result };
  }

  static async deleteOne({ id }: { id: number }): Promise<FetchResponse> {
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
}
