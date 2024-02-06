import React from 'react';
import CheckInForm from './Form';
import { formatString } from 'utils/helpers';

const DUMMY_COMPANY_NAME = 'P&H MGMT LC Troy License Office';
const DUMMY_DIVISIONS = ['Motor Vehicle', 'Driver License'];

export default function CustomerCheckInView() {
  // on first render, get the office name and divisions from the server

  return (
    <div className="flex h-full">
      <main className="m-auto w-full max-w-96 p-4">
        <h1 className="mb-12 text-center text-2xl font-bold">
          {formatString(DUMMY_COMPANY_NAME, 16)
            .split('\n')
            .map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
        </h1>
        {/* max width needed */}
        <h2 className="text-onyx mb-4 text-xl font-medium">Self Check In</h2>

        <CheckInForm
          divisions={DUMMY_DIVISIONS}
          onSubmitSuccess={(customer) => console.log(customer)}
        />
      </main>
    </div>
  );
}
