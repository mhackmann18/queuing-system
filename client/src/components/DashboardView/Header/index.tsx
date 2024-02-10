import CurrentTime from 'components/CurrentTime';
import React, { useContext } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { MdAccountCircle } from 'react-icons/md';
import { UserContext } from 'components/UserContextProvider/context';

export default function DashboardHeader() {
  const { username } = useContext(UserContext);

  return (
    <header className="border-platinum-700 fixed inset-x-0 top-0 z-10 h-16 border-b bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between">
        <div className="flex items-center">
          <Breadcrumbs />
        </div>
        <div className="flex items-center">
          <CurrentTime styles="mr-6" />
          <button
            type="button"
            className="text-french_gray_2 hover:text-french_gray_2-400 flex items-center"
          >
            <span className="mr-1.5 font-medium">{username}</span>
            <MdAccountCircle className="inline" size={26} />
          </button>
        </div>
      </div>
    </header>
  );
}
