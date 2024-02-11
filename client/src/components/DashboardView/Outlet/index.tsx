import { Outlet } from 'react-router-dom';
import DashboardHeader from '../Header';

export default function DashboardOutlet() {
  return (
    <>
      <DashboardHeader />
      <div className="relative mx-auto mt-16 h-[calc(100vh-4rem)] max-w-5xl">
        <Outlet />
      </div>
    </>
  );
}
