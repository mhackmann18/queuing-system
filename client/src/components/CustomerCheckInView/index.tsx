import { useEffect, useState } from 'react';
import SuccessPage from './SuccessPage';
import CheckIn from './CheckIn';

const SUCCESS_MESSAGE_DURATION = 5000;

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

  return (
    <div className="fixed inset-0 z-20 h-lvh w-screen bg-white">
      {!displaySuccess ? (
        <div className="flex h-full">
          <CheckIn
            onSubmitSuccess={(customer) => {
              console.log(customer);
              setDisplaySuccess(true);
            }}
          />
        </div>
      ) : (
        <SuccessPage onDoneBtnClick={() => setDisplaySuccess(false)} />
      )}
    </div>
  );
}
