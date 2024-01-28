import { Customer, Department } from 'utils/types';
import { ActionViewConfigProp } from './ActionView/types';

export interface CustomerPanelProps {
  customer: Customer;
  containerStyles?: string;
  actionConfig: ActionViewConfigProp | null;
  currentDept: Department;
}
