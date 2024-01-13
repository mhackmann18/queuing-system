import { ReactEventHandler } from 'react';
import { Station } from 'components/types';

interface StationIconProps {
  onClick: ReactEventHandler;
  station: Station;
}

export default function StationIcon({ onClick, station }: StationIconProps) {
  const styles = {
    MV1: 'bg-mv1',
    MV2: 'bg-mv2',
    MV3: 'bg-mv3',
    MV4: 'bg-mv4',
    DL1: 'bg-dl1',
    DL2: 'bg-dl2'
  };

  return (
    <button
      className={`${styles[station]} h-11 w-11 rounded-full border-0 text-sm font-semibold text-white`}
      type="button"
      onClick={onClick}
    >
      {station}
    </button>
  );
}
