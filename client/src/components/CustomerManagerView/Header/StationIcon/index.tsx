import { StationIconProps } from './types';
import './styles.css';
import { useContext } from 'react';
import { UserContext } from 'components/UserContextProvider/context';

export default function StationIcon({
  onClick,
  forwardRef,
  menuActive
}: StationIconProps) {
  const user = useContext(UserContext);
  const tokens = user.division.split(' ');
  const stationId = `${tokens[0][0]}${tokens[1][1]}${user.deskNum}`;

  const stylesByDeskNum = [
    'bg-desk_1',
    'bg-desk_2',
    'bg-desk_3',
    'bg-desk_4',
    'bg-desk_5',
    'bg-desk_6'
  ];

  return (
    <button
      className={`${stylesByDeskNum[user.deskNum > 6 ? 6 : user.deskNum]} ${
        menuActive ? 'si-outline-dark' : 'si-outline-light'
      } relative h-10 w-10 rounded-full text-sm font-semibold text-white`}
      type="button"
      onClick={onClick}
      ref={forwardRef}
    >
      {stationId}
    </button>
  );
}
