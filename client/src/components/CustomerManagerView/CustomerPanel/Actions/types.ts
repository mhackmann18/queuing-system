import { Customer } from 'utils/types';
import { CustomerPanelActionEventHandlers, CustomerPanelState } from '../types';

export interface CustomerPanelActionsProps {
  customer: Customer;
  actionEventHandlers: CustomerPanelActionEventHandlers;
  panelState: CustomerPanelState;
  setPanelState: (panelState: CustomerPanelState) => void;
}
