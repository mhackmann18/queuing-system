import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import CurrentTime from 'components/CurrentTime';
import React from 'react';
import DeskIcon from 'components/CustomerManagerView/Header/DeskIcon';

interface DashboardHeaderProps {
  backLink?: string;
  viewTitle: string;
  bottomRowChild: React.ReactNode;
}

export default function DashboardHeader({
  backLink,
  viewTitle,
  bottomRowChild
}: DashboardHeaderProps) {
  return (
    <header className="h-28">
      {/* Header Row 1 */}
      <div className="border-french_gray_1-600 border-b">
        <div className="relative mx-auto flex h-16 max-w-5xl justify-between">
          <div className="flex items-center">
            {backLink && (
              <Link to={backLink} className="absolute -left-8 mr-4">
                <IoArrowBack size={18} />
              </Link>
            )}
            <h1 className="mr-4 inline-block w-80 items-center text-2xl font-bold">
              {viewTitle}
            </h1>
          </div>
          <div className="flex items-center">
            <CurrentTime styles="text-onyx-600 font-medium mr-3" />
            <DeskIcon onClick={() => null} focused={false} />
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
