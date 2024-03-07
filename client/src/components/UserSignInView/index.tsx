import { useEffect, useState } from 'react';
import FormGeneralUser from './FormGeneralUser';
import UserTypeButton from './UserTypeButton';
import { useLocation } from 'react-router-dom';
import ErrorAlert from 'components/ErrorAlert';

export default function UserSignInView() {
  const [userType, setUserType] = useState<'root' | 'general'>('general');
  const { state } = useLocation();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (state?.error) {
      // Clear the error from the url
      window.history.replaceState({}, '', '/sign-in');

      // Set the error state
      setError(state.error);
    }
  }, [state]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex max-w-96 flex-col p-4 text-left">
        {/* Heading */}
        <h2 className=" text-onyx mb-4 text-2xl font-semibold">Sign In</h2>

        {/* User type radio buttons */}
        <fieldset name="user-type">
          <UserTypeButton
            type="general"
            labelText="General User"
            message="Can view service history and manage customer queues within their assigned office."
            onClick={() => setUserType('general')}
            selected={userType === 'general'}
          />
          <UserTypeButton
            type="root"
            labelText="Root User"
            message="Can manage all offices, users, and customers."
            onClick={() => setUserType('root')}
            selected={userType === 'root'}
          />
        </fieldset>

        {/* General user signin form */}
        {userType === 'general' ? <FormGeneralUser /> : 'Not implemented'}
      </div>
      {error && (
        <ErrorAlert
          close={() => setError('')}
          error={state.error}
          styles="fixed bottom-10 right-10"
        />
      )}
    </div>
  );
}
