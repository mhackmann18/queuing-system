import customers from './customers';
import { sameDay } from 'utils/helpers';
import { Customer } from 'components/types';

interface GetCustomerRequestBody {
  date: Date;
}

interface FetchResponse {
  error?: string;
  data: Customer[];
}

export default class CustomerController {
  static async get({ date }: GetCustomerRequestBody): Promise<FetchResponse> {
    const result = customers.filter((c) => sameDay(c.checkInTime, date));
    return { data: result };
  }

  static async deleteOne({ id }: { id: number }): Promise<FetchResponse> {
    return { data: customers.filter((c) => c.id !== id) };
  }
}
