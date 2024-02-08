import { useState } from 'react';
import FormGeneralUser from './FormGeneralUser';
import UserTypeButton from './UserTypeButton';

export default function UserSignInView() {
  const [userType, setUserType] = useState<'root' | 'general'>('general');

  return (
    <div className="flex h-full items-center justify-center">
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
        {userType === 'general' ? (
          <FormGeneralUser
            onSubmitSuccess={(data) => {
              console.log(data);
            }}
          />
        ) : (
          'Not implemented'
        )}
      </div>
    </div>
  );
}
