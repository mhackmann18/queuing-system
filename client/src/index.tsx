import { createRoot } from 'react-dom/client';
import 'tailwindcss/tailwind.css';
import App from 'App';
import UserContextProvider from 'components/UserContextProvider';
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
          <UserContextProvider>
            <DashboardOutlet />
          </UserContextProvider>
        ),
        children: [
          {
            index: true,
            element: <DashboardView />
          },
          {
            path: 'customer-manager', // :desk-
            element: <Outlet />,
            children: [
              {
                index: true,
                element: <DeskPickerView />
              },
              {
                path: ':customersType',
                element: <CustomerManagerView />
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
