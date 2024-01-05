import { ReactEventHandler } from 'react';

interface CustomerItemComponent {
  status: CustomerStatus;
  name: string;
  checkInTime: Date;
  callTime: Date;
  onClick: ReactEventHandler;
}

type CustomerStatus = 'Waiting' | 'Serving' | 'Served' | 'No Show';

export default function CustomerItem({
  status,
  name,
  checkInTime,
  callTime,
  onClick
}: CustomerItemComponent) {
  return (
    <div onClick={onClick}>
      <div>
        <span>{status}</span>
        <span>{name}</span>
      </div>
      <div>
        <span>{checkInTime.toUTCString()}</span>
        <span>{callTime.toUTCString()}</span>
      </div>
    </div>
  );
}
