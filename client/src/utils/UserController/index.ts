import { Division } from 'utils/types';

export default class UserController {
  static async getNumDesks({
    officeId,
    division
  }: {
    officeId: number;
    division: Division;
  }) {
    // Make get request to /api/v1/office_id/division_id/desks

    if (division === 'Motor Vehicle') {
      return 4;
    } else {
      return 2;
    }
  }
}
