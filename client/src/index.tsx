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
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <DashboardView />
          },
          {
            path: 'customer-manager/:deskName', // :desk-
            element: <CustomerManagerView />
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
            element: 'Service History'
          }
        ]
      }
    ]
  }
]);

root.render(
  <UserContextProvider>
    <RouterProvider router={router} />
  </UserContextProvider>
);
