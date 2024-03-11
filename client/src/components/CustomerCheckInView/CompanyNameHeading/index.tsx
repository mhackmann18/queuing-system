// import { Fragment } from 'react';
// import { formatString } from 'utils/helpers';
import { CompanyNameHeadingProps } from './types';

export default function CompanyNameHeading({
  companyName
}: CompanyNameHeadingProps) {
  return (
    <h1 className="text-onyx mb-16 text-center text-5xl font-semibold">
      {/* {formatString(companyName, 16)
        .split('\n')
        .map((line, index) => (
          <Fragment key={index}>
            {line}
            <br />
          </Fragment>
        ))} */}
      {companyName}
    </h1>
  );
}
