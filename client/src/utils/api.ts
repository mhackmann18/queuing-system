import { API_BASE_PATH } from 'utils/constants';

// Courtesy of https://www.wolff.fun/definitive-guide-react-apis/
const api = {
  get: (endpoint: string, authToken?: string) =>
    fetch(`${API_BASE_PATH}/${endpoint}`, {
      method: 'GET',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    }),
  post: (endpoint: string, body?: object, authToken?: string) =>
    fetch(`${API_BASE_PATH}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      },
      body: body && JSON.stringify(body)
    }),
  patch: (endpoint: string, body: object, authToken?: string) =>
    fetch(`${API_BASE_PATH}/${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      },
      body: body && JSON.stringify(body)
    }),
  delete: (endpoint: string, authToken?: string) =>
    fetch(`${API_BASE_PATH}/${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    })
};

const functions = {
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
  loginUser: (userCredentials: object) => api.post('users/login', userCredentials),
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
