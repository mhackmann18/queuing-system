import { DeskIconProps } from './types';
import { useContext } from 'react';
import { UserContext } from 'components/ContextProviders/UserContextProvider/context';
import { getDeskName } from 'utils/helpers';
import './styles.css';

export default function DeskIcon({ onClick, forwardRef, focused }: DeskIconProps) {
  const user = useContext(UserContext);

  const stylesByDeskNum = [
    '',
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
        focused ? 'si-outline-dark' : 'si-outline-light'
      } relative h-10 w-10 rounded-full text-sm font-semibold text-white`}
      type="button"
      onClick={onClick}
      ref={forwardRef}
    >
      {getDeskName(user.division, user.deskNum)}
    </button>
  );
}
