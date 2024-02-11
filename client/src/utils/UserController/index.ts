export default class UserController {
  static async getNumDesks({
    officeId,
    division
  }: {
    officeId: number;
    division: string;
  }) {
    // Make get request to /api/v1/office_id/division_id/desks

    if (division === 'Motor Vehicle') {
      return 4;
    } else {
      return 2;
    }
  }

  static async signIn({
    username,
    password
  }: {
    username: string;
    password: string;
  }) {
    console.log(username, password);

    // Make post request to /api/v1/signin
    return {
      data: null,
      error: 'Not implemented'
    };
  }

  static async getDivisionsByOfficeId(officeId: number) {
    // Make get request to /api/v1/offices/:office_id/divisions
    console.log(officeId);
    return { data: ['Motor Vehicle', 'Driver License'], error: '' };
  }

  static async getDesksByOffice(officeId: string): Promise<{
    data:
      | { divisionName: string; numDesks: number; availableDeskNums: number[] }[]
      | null;
    error?: string;
  }> {
    // Get divisions: GET /api/v1/offices/:officeId/divisions

    // Get desks for each division: GET /api/v1/divisions/:divisionId/desks

    return {
      data: [
        { divisionName: 'Motor Vehicle', numDesks: 4, availableDeskNums: [1, 3, 4] },
        { divisionName: 'Driver License', numDesks: 2, availableDeskNums: [1, 2] }
      ]
    };
  }
}
