import { Customer } from 'utils/types';

export interface CheckInFormProps {
  divisions: string[];
  onSubmitSuccess: (data: Customer) => void;
}

export interface CheckInFormValues {
  fullName: string;
  reasonForVisit: string[];
}
