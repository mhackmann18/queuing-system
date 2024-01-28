import { Customer } from 'utils/types';
import { ActionViewConfigProp } from '../ActionView/types';

export interface CustomerPanelWrapperProps {
  customer: Customer;
  containerStyles?: string;
  actionConfig: ActionViewConfigProp | null;
}
