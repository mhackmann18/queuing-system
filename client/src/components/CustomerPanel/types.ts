import { Customer, Department } from 'utils/types';
import { ActionViewConfigProp } from './ActionView/types';

export interface CustomerPanelProps {
  customer: Customer;
  actionConfig: ActionViewConfigProp | null;
  currentDept: Department;
}
