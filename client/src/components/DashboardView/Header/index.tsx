import CurrentTime from 'components/CurrentTime';
import { useState, useRef } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { MdAccountCircle } from 'react-icons/md';
import ProfileMenu from './ProfileMenu';
import useAuth from 'hooks/useAuth';

export default function DashboardHeader() {
  const { user } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="border-platinum-700 fixed inset-x-0 top-0 z-10 h-16 border-b bg-white shadow-sm">
      <div className="relative mx-auto flex h-full max-w-5xl items-center justify-between">
        <div className="flex items-center">
          <Breadcrumbs />
        </div>
        <div className="flex items-center">
          <CurrentTime styles="mr-6" />
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            ref={profileButtonRef}
            type="button"
            className="text-french_gray_2 hover:text-french_gray_2-400 flex items-center"
          >
            <span className="mr-1.5 font-medium">{user!.username}</span>
            <MdAccountCircle className="inline" size={26} />
          </button>
          {profileMenuOpen && (
            <ProfileMenu
              open={profileMenuOpen}
              setOpen={setProfileMenuOpen}
              buttonRef={profileButtonRef}
              containerStyles="absolute right-0 top-14 z-20"
            />
          )}
        </div>
      </div>
    </header>
  );
}
