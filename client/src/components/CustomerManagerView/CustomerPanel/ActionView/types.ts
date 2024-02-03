import { Customer } from 'utils/types';
import { ActionEventHandlersProp, CustomerPanelState } from '../types';

export interface CustomerPanelActionViewProps {
  customer: Customer;
  actionEventHandlers: ActionEventHandlersProp;
  panelState: CustomerPanelState;
  setPanelState: (panelState: CustomerPanelState) => void;
}
