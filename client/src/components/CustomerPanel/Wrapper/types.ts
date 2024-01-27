import { Customer } from 'utils/types';
import { ActionViewConfigProp } from '../ActionView';

export interface CustomerPanelWrapperProps {
  customer: Customer;
  containerStyles?: string;
  actionConfig: ActionViewConfigProp | null;
}
