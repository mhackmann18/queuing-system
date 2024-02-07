import { useState } from 'react';
import FormGeneralUser from './FormGeneralUser';

export default function UserSignInView() {
  const [userType, setUserType] = useState<'root' | 'general'>('general');

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex max-w-96 flex-col text-left">
        <h2 className=" text-onyx mb-4 text-2xl font-semibold">Sign In</h2>

        <fieldset>
          <button
            onClick={() => setUserType('general')}
            className={`mb-2 w-full rounded-md border p-4 ${
              userType === 'general' ? 'bg-seasalt border-french_gray_2' : ''
            }`}
          >
            <div className="mb-1.5 flex items-center">
              <input
                type="radio"
                id="general"
                name="user-type"
                value="general"
                checked={userType === 'general'}
                className="mr-4 inline-block h-5 w-5"
                onChange={() => setUserType('general')}
              />
              <label htmlFor="general" className="align-top text-lg font-medium">
                General User
              </label>
            </div>
            <p className="font-md text-slate_gray text-left">
              Can manage customer queues and view service history within their
              assigned office.
            </p>
          </button>
          <button
            onClick={() => setUserType('root')}
            className={`mb-2 w-full rounded-md border p-4 ${
              userType === 'root' ? 'bg-seasalt border-french_gray_2' : ''
            }`}
          >
            <div className="mb-1.5 flex items-center">
              <input
                type="radio"
                id="root"
                name="user-type"
                value="root"
                checked={userType === 'root'}
                className="mr-4 inline-block h-5 w-5"
                onChange={() => setUserType('root')}
              />
              <label htmlFor="root" className="align-top text-lg font-medium">
                Root User
              </label>
            </div>
            <p className="font-md text-slate_gray text-left">
              Can manage all offices, users, and customers.
            </p>
          </button>
        </fieldset>

        <FormGeneralUser />
      </div>
    </div>
  );
}
