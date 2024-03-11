import { Customer } from 'utils/types';
import CompanyNameHeading from '../CompanyNameHeading';
import CheckInForm from '../Form';
import useOffice from 'hooks/useOffice';

interface CheckInProps {
  onSubmitSuccess: (customer: Customer) => void;
}

const DUMMY_COMPANY_NAME = 'P&H MGMT LC';

export default function CheckIn({ onSubmitSuccess }: CheckInProps) {
  const { divisionNames, name: officeName } = useOffice();

  return (
    <main className="m-auto w-full max-w-md p-4">
      <CompanyNameHeading companyName={`${DUMMY_COMPANY_NAME} ${officeName}`} />

      <h2 className=" text-onyx mb-6 text-4xl font-semibold">Check In</h2>

      <CheckInForm divisions={divisionNames} onSubmitSuccess={onSubmitSuccess} />
    </main>
  );
}
