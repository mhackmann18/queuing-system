import CurrentTime from 'components/CurrentTime';
import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import { MdAccountCircle } from 'react-icons/md';

interface DashboardHeaderProps {
  bottomRowChild: React.ReactNode;
}

export default function DashboardHeader({ bottomRowChild }: DashboardHeaderProps) {
  return (
    <header className="h-28">
      {/* Header Row 1 */}
      <div className="border-platinum-700 border-b">
        <div className="relative mx-auto flex h-16 max-w-5xl justify-between">
          <div className="flex items-center">
            <Breadcrumbs />
          </div>
          <div className="flex items-center">
            <CurrentTime styles="mr-4" />
            <button
              type="button"
              className="text-french_gray_2 hover:text-french_gray_2-400"
            >
              <MdAccountCircle size={26} />
            </button>
          </div>
        </div>
      </div>
      {/* Header Row 2 */}
      <div className="border-b shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between py-3">
          {bottomRowChild}
        </div>
      </div>
    </header>
  );
}
