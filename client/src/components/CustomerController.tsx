import customers from './customers';
import { sameDay } from 'utils/helpers';
import { Customer } from 'components/types';

interface GetCustomerRequestBody {
  date: Date;
}

// interface FetchResponse {
//   error?: string;
//   data: object;
// }

export default class CustomerController {
  static async getCustomers({
    date
  }: GetCustomerRequestBody): Promise<{ error?: string; data: Customer[] }> {
    const result = customers.filter((c) => sameDay(c.checkInTime, date));
    return { data: result };
  }

  static async deleteOne({
    id
  }: {
    id: number;
  }): Promise<{ error?: string; data: Customer[] }> {
    return { data: customers.filter((c) => c.id !== id) };
  }
}
