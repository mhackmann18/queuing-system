import { ReactEventHandler } from 'react';
import { Station } from 'utils/types';

export interface StationIconProps {
  onClick: ReactEventHandler;
  station: Station;
  forwardRef?: React.RefObject<HTMLButtonElement>;
  menuActive: boolean;
}
