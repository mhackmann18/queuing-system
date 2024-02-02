import { useEffect, useRef, useContext } from 'react';
import { UserContext } from 'components/UserContextProvider/context';
import { StationMenuProps } from './types';

export default function StationMenu({
  setError,
  active,
  setActive,
  buttonRef
}: StationMenuProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const user = useContext(UserContext);

  const menuStylesByDeskNum = [
    '',
    'bg-desk_1',
    'bg-desk_2',
    'bg-desk_3',
    'bg-desk_4',
    'bg-desk_5',
    'bg-desk_6'
  ];

  // Close menu when clicking outside of menu
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        active &&
        elementRef.current &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !elementRef.current.contains(event.target as Node)
      ) {
        setActive(!active);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [active, setActive, buttonRef]);

  return (
    <div
      ref={elementRef}
      className={`border-slate_gray absolute right-0 top-14 z-20 overflow-hidden rounded-md border bg-white shadow-md ${
        active ? 'block' : 'hidden'
      }`}
    >
      <div
        className={`bg-mv1 p-3 font-medium text-white ${
          menuStylesByDeskNum[user.deskNum > 6 ? 6 : user.deskNum]
        }`}
      >
        <h4>{`${user.division} Desk ${user.deskNum}`}</h4>
      </div>
      <div className="p-2">
        <button
          onClick={() => setError('Not yet implemented.')}
          type="button"
          className="hover:bg-platinum-800 block w-full rounded-md p-3 text-left text-sm font-medium"
        >
          Sign out
        </button>
        <button
          onClick={() => setError('Not yet implemented.')}
          type="button"
          className="hover:bg-platinum-800 block w-full rounded-md p-3 text-left text-sm font-medium"
        >
          Switch Stations
        </button>
      </div>
    </div>
  );
}
