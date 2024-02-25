import { createRoot } from 'react-dom/client';
import 'tailwindcss/tailwind.css';
import App from 'App';
import UserContextProvider from 'components/ContextProviders/UserContextProvider';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import UserSignInView from 'components/UserSignInView';
import DashboardView from 'components/DashboardView';
import CustomerCheckInView from 'components/CustomerCheckInView';
import CustomerWaitingListView from 'components/CustomerWaitingListView';
import CustomerManagerView from 'components/CustomerManagerView';
import ServiceHistoryView from 'components/ServiceHistoryView';
import DashboardOutlet from 'components/DashboardView/Outlet';
import DeskPickerView from 'components/DeskPickerView';
import { Outlet } from 'react-router-dom';
import PrivateRoute from 'components/PrivateRoute';
import DeskRequired from 'components/DeskRequired';

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'sign-in',
        element: <UserSignInView />
      },
      {
        path: 'dashboard',
        element: (
          <PrivateRoute>
            <UserContextProvider>
              <DashboardOutlet />
            </UserContextProvider>
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardView />
          },
          {
            path: 'customer-manager',
            element: <Outlet />,
            children: [
              {
                index: true,
                element: <DeskPickerView />
              },
              {
                path: ':divisionName-desk-deskNum',
                element: (
                  <DeskRequired>
                    <CustomerManagerView />
                  </DeskRequired>
                )
              }
            ]
          },
          {
            path: 'waiting-list',
            element: <CustomerWaitingListView />
          },
          {
            path: 'check-in-kiosk',
            element: <CustomerCheckInView />
          },
          {
            path: 'service-history',
            element: <ServiceHistoryView />
          }
        ]
      }
    ]
  }
]);

root.render(<RouterProvider router={router} />);
