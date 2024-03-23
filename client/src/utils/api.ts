import { API_BASE_PATH } from 'utils/constants';
import axios from 'axios';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error);
    if (!axios.isAxiosError(error)) {
      throw new Error(String(error));
    }

    if (error.response) {
      if (error.response.status < 500) {
        if (error.response.status === 401) {
          return Promise.reject(error);
        }
        throw new Error(error.response.data || error.message || String(error));
      } else {
        throw new Error('Server error');
      }
    } else if (error.request) {
      throw new Error('The server did not respond');
    } else {
      throw new Error(error.message || 'An error occurred');
    }
  }
);

// Courtesy of https://www.wolff.fun/definitive-guide-react-apis/
const api = {
  get: (endpoint: string, authToken?: string) =>
    axios.get(`${API_BASE_PATH}/${endpoint}`, {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    }),
  post: (endpoint: string, body?: object, authToken?: string) =>
    axios.post(`${API_BASE_PATH}/${endpoint}`, body && JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    }),
  put: (endpoint: string, body: object, authToken?: string) =>
    axios.put(`${API_BASE_PATH}/${endpoint}`, body && JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    }),
  patch: (endpoint: string, body: object, authToken?: string) =>
    axios.patch(`${API_BASE_PATH}/${endpoint}`, body && JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    }),
  delete: (endpoint: string, authToken?: string) =>
    axios.delete(`${API_BASE_PATH}/${endpoint}`, {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    })
};

interface DivisionData {
  name: string;
  status?: string;
  waitingListIndex?: number;
}

const functions = {
  updateReasonsForVisit: (
    officeId: string,
    customerId: string,
    reasonsForVisit: Array<string>,
    authToken: string
  ) =>
    api.get(`customers/${customerId}`, authToken).then((customer) => {
      const divisions = customer.data.divisions as DivisionData[];

      // Filter out divisions that are not in the reasonsForVisit array
      const body = divisions.filter((division) =>
        reasonsForVisit.includes(division.name)
      );

      // Add reasonsForVisit that are not in the divisions array
      reasonsForVisit.forEach((reasonForVisit) => {
        if (!divisions.find((division) => division.name === reasonForVisit)) {
          body.push({ name: reasonForVisit });
        }
      });

      return api.put(
        `offices/${officeId}/customers/${customerId}/divisions`,
        body,
        authToken
      );
    }),
  postUserToDesk: (
    officeId: string,
    userId: string,
    desk: object,
    authToken: string
  ) => api.post(`offices/${officeId}/users/${userId}/desk`, desk, authToken),
  getUserFromAuthToken: (authToken: string) => api.get('users/self', authToken),
  getOfficeDivisions: (officeId: string, authToken: string) =>
    api.get(`offices/${officeId}/divisions`, authToken),
  deleteUserFromDesk: (officeId: string, userId: string, authToken: string) =>
    api.delete(`offices/${officeId}/users/${userId}/desk`, authToken),
  patchCustomer: (
    officeId: string,
    customerId: string,
    body: object,
    authToken: string
  ) => api.patch(`offices/${officeId}/customers/${customerId}`, body, authToken),
  postCustomer: (officeId: string, body: object, authToken: string) =>
    api.post(`offices/${officeId}/customers`, body, authToken),
  getCustomersWithFilters: (officeId: string, body: object, authToken: string) =>
    api.post(`offices/${officeId}/customers/query`, body, authToken),
  getOffice: (officeId: string, authToken: string) =>
    api.get(`offices/${officeId}`, authToken),
  deleteCustomer: (officeId: string, customerId: string, authToken: string) =>
    api.delete(`offices/${officeId}/customers/${customerId}`, authToken),
  extendUserDeskSession: (officeId: string, userId: string, authToken: string) =>
    api.post(
      `offices/${officeId}/users/${userId}/desk/extend-session`,
      undefined,
      authToken
    )
};

export default functions;
