import { useEffect, useState } from 'react';
import SuccessPage from './SuccessPage';
import CheckInForm from './Form';
import CompanyNameHeading from './CompanyNameHeading';

const SUCCESS_MESSAGE_DURATION = 5000;

// TODO: replace with real data
const DUMMY_COMPANY_NAME = 'P&H MGMT LC Troy License Office';
const DUMMY_DIVISIONS = ['Motor Vehicle', 'Driver License'];

// TODO: responsive design. Kiosks could be a tablet, phone, or desktop
export default function CustomerCheckInView() {
  const [displaySuccess, setDisplaySuccess] = useState(false);

  // on first render, get the office name and divisions from the server

  // Close the success message after a few seconds
  useEffect(() => {
    if (!displaySuccess) {
      return;
    }

    setTimeout(() => {
      setDisplaySuccess(false);
    }, SUCCESS_MESSAGE_DURATION);
  }, [displaySuccess]);

  return !displaySuccess ? (
    <div className="flex h-full">
      <main className="m-auto w-full max-w-96 p-4">
        <CompanyNameHeading companyName={DUMMY_COMPANY_NAME} />

        <h2 className=" text-onyx mb-4 text-2xl font-semibold">Check In</h2>

        <CheckInForm
          divisions={DUMMY_DIVISIONS}
          onSubmitSuccess={(customer) => {
            console.log(customer);
            setDisplaySuccess(true);
          }}
        />
      </main>
    </div>
  ) : (
    <SuccessPage onDoneBtnClick={() => setDisplaySuccess(false)} />
  );
}
