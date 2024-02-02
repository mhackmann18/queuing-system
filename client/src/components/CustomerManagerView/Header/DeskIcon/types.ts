import { ReactEventHandler } from 'react';

export interface DeskIconProps {
  onClick: ReactEventHandler;
  forwardRef?: React.RefObject<HTMLButtonElement>;
  focused: boolean;
}
