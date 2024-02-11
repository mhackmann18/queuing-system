import { Link } from 'react-router-dom';
import { PiUserListBold } from 'react-icons/pi';
import { LuListChecks } from 'react-icons/lu';

import { FaTabletScreenButton } from 'react-icons/fa6';
import { PiTelevisionSimpleBold } from 'react-icons/pi';

export default function DashboardView() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col">
        <h2 className="mb-2 text-lg font-medium">Employee Utilities</h2>
        <Link
          to="customer-manager"
          className="bg-onyx hover:bg-outer_space mb-2 flex items-center rounded-md p-3 text-white"
        >
          <PiUserListBold className="mr-2" />
          Customer Manager
        </Link>
        <Link
          to="service-history"
          className="bg-onyx hover:bg-outer_space mb-2 flex items-center rounded-md p-3 text-white"
        >
          <LuListChecks className="mr-2" />
          Service History
        </Link>
        <h2 className="mb-2 text-lg font-medium">Customer Facing</h2>
        <Link
          to="check-in-kiosk"
          className="bg-onyx hover:bg-outer_space mb-2 flex items-center rounded-md p-3 text-white"
        >
          <FaTabletScreenButton className="mr-2" />
          Display Check In Kiosk
        </Link>
        <Link
          to="waiting-list"
          className="bg-onyx hover:bg-outer_space mb-2 flex items-center rounded-md p-3 text-white"
        >
          <PiTelevisionSimpleBold className="mr-2" />
          Display Waiting List
        </Link>
      </div>
    </div>
  );
}
