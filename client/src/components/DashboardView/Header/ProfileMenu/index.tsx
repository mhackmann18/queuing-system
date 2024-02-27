import { useRef, RefObject, useEffect, useState } from 'react';
import useAuth from 'hooks/useAuth';
import Error from 'components/Error';

interface ProfileMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement>;
  containerStyles?: string;
}

export default function ProfileMenu({
  open,
  setOpen,
  buttonRef,
  containerStyles = ''
}: ProfileMenuProps) {
  const { logOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');

  // Close menu when clicking outside of menu
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        open &&
        menuRef.current &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(!open);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open, setOpen, buttonRef]);

  const handleSignOutClick = async () => {
    logOut();
  };

  return (
    <>
      <div
        ref={menuRef}
        className={`border-french_gray_2 w-44 rounded-sm border bg-white p-3 text-sm shadow-md
       ${containerStyles}`}
      >
        <button
          onClick={() => setError('Settings are not available yet')}
          className="bg-french_gray_1-700 hover:bg-french_gray_1 mb-2 block w-full rounded-md
       px-3 py-2 text-left"
        >
          Settings
        </button>
        <button
          onClick={handleSignOutClick}
          className="bg-french_gray_1-700 hover:bg-french_gray_1 block w-full rounded-md px-3
       py-2 text-left"
        >
          Sign Out
        </button>
      </div>
      {error && (
        <Error
          styles="fixed bottom-10 right-10 text-base"
          error={error}
          close={() => setError('')}
        />
      )}
    </>
  );
}
