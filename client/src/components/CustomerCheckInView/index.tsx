import { useEffect, useState, useRef } from 'react';
import SuccessPage from './SuccessPage';
import CheckIn from './CheckIn';

const SUCCESS_MESSAGE_DURATION = 5000;

// TODO: responsive design. Kiosks could be a tablet, phone, or desktop
export default function CustomerCheckInView() {
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Close the success message after a few seconds
  useEffect(() => {
    if (!displaySuccess) {
      return;
    }

    timeoutIdRef.current = setTimeout(() => {
      setDisplaySuccess(false);
      timeoutIdRef.current = null;
    }, SUCCESS_MESSAGE_DURATION);
  }, [displaySuccess]);

  return (
    <div className="fixed inset-0 z-20 h-lvh w-screen bg-white">
      {!displaySuccess ? (
        <div className="flex h-full">
          <CheckIn
            onSubmitSuccess={() => {
              setDisplaySuccess(true);
            }}
          />
        </div>
      ) : (
        <SuccessPage
          onDoneBtnClick={() => {
            timeoutIdRef.current && clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
            setDisplaySuccess(false);
          }}
        />
      )}
    </div>
  );
}
