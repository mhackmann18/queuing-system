import { Link } from 'react-router-dom';

export default function DashboardView() {
  return (
    <div className="flex h-full items-center justify-center">
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
