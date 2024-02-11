import { Customer } from 'utils/types';
import CompanyNameHeading from '../CompanyNameHeading';
import CheckInForm from '../Form';

// TODO: replace with real data
const DUMMY_COMPANY_NAME = 'P&H MGMT LC Troy License Office';
const DUMMY_DIVISIONS = ['Motor Vehicle', 'Driver License'];

interface CheckInProps {
  onSubmitSuccess: (customer: Customer) => void;
}

export default function CheckIn({ onSubmitSuccess }: CheckInProps) {
  return (
    <main className="m-auto w-full max-w-96 p-4">
      <CompanyNameHeading companyName={DUMMY_COMPANY_NAME} />

      <h2 className=" text-onyx mb-4 text-2xl font-semibold">Check In</h2>

      <CheckInForm divisions={DUMMY_DIVISIONS} onSubmitSuccess={onSubmitSuccess} />
    </main>
  );
}
