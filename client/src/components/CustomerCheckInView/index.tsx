import React from 'react';
import CheckInForm from './Form';

const DUMMY_COMPANY_NAME = 'P&H MGMT LC Troy License Office';
const DUMMY_DIVISIONS = ['Motor Vehicle', 'Driver License'];

function formatString(input: string, lineLength: number) {
  const words = input.split(' ');
  let line = '';
  let result = '';

  for (let i = 0; i < words.length; i++) {
    if ((line + words[i]).length <= lineLength) {
      line += words[i] + ' ';
    } else {
      result += line + '\n';
      line = words[i] + ' ';
    }
  }

  result += line;
  return result;
}

export default function CustomerCheckInView() {
  // on first render, get the office name from the server

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
        <h2 className="text-outer_space mb-4 text-xl font-medium">Self Check In</h2>

        <CheckInForm divisions={DUMMY_DIVISIONS} />
      </main>
    </div>
  );
}
