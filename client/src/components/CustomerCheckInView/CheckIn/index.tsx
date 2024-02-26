import { Customer } from 'utils/types';
import CompanyNameHeading from '../CompanyNameHeading';
import CheckInForm from '../Form';
import useOffice from 'hooks/useOffice';

interface CheckInProps {
  onSubmitSuccess: (customer: Customer) => void;
}

export default function CheckIn({ onSubmitSuccess }: CheckInProps) {
  const { divisionNames, name: officeName } = useOffice();

  return (
    <main className="m-auto w-full max-w-96 p-4">
      <CompanyNameHeading companyName={officeName} />

      <h2 className=" text-onyx mb-4 text-2xl font-semibold">Check In</h2>

      <CheckInForm divisions={divisionNames} onSubmitSuccess={onSubmitSuccess} />
    </main>
  );
}
