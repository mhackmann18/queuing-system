import { getDeptFromStation } from 'utils/helpers';
import UserContext from 'components/UserContext';
import { useContext, useRef } from 'react';
import { Station } from 'utils/types';
import { StationMenuProps } from './types';

export default function StationMenu({ setError }: StationMenuProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const user = useContext(UserContext);

  const menuStylesByStation: Record<Station | 'none', string> = {
    MV1: 'bg-mv1',
    MV2: 'bg-mv2',
    MV3: 'bg-mv3',
    MV4: 'bg-mv4',
    DL1: 'bg-dl1',
    DL2: 'bg-dl2',
    none: 'bg-white'
  };

  return (
    <div
      ref={elementRef}
      className="border-slate_gray absolute right-0 top-14 z-20 overflow-hidden rounded-md border bg-white shadow-md"
    >
      <div
        className={`bg-mv1 p-3 font-medium text-white ${
          menuStylesByStation[user!.station]
        }`}
      >
        <h4>
          {getDeptFromStation(user!.station)} Station {user!.station[2]}
        </h4>
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
