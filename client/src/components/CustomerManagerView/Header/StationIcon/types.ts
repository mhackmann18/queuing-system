import { ReactEventHandler } from 'react';

export interface StationIconProps {
  onClick: ReactEventHandler;
  forwardRef?: React.RefObject<HTMLButtonElement>;
  menuActive: boolean;
}
