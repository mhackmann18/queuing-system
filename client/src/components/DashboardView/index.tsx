import { UserContext } from 'components/UserContextProvider/context';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

export default function DashboardView() {
  const user = useContext(UserContext);

  return (
    <div className="flex h-full items-center justify-center">
      <nav className="fixed inset-x-0 top-0 flex h-20 items-center justify-between shadow-sm">
        <h1 className="pl-10">Welcome back {user.firstName}</h1>
        <button className="pr-10">Sign out</button>
      </nav>
      <div className="flex flex-col">
        <Link
          to="customer-manager"
          className="bg-onyx hover:bg-outer_space mb-2 rounded-md p-3 text-white"
        >
          Customer Manager
        </Link>
        <Link
          to="waiting-list"
          className="bg-onyx hover:bg-outer_space mb-2 rounded-md p-3 text-white"
        >
          Waiting List
        </Link>
        <Link
          to="service-history"
          className="bg-onyx hover:bg-outer_space mb-2 rounded-md p-3 text-white"
        >
          Service History
        </Link>
        <Link
          to="check-in-kiosk"
          className="bg-onyx hover:bg-outer_space mb-2 rounded-md p-3 text-white"
        >
          Check In Kiosk
        </Link>
      </div>
    </div>
  );
}
