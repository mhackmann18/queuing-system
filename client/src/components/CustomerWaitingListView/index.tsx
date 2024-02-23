import { useState } from 'react';
import WaitingList from './WaitingList';
import './styles.css';

// TODO: Fetch divisions on mount
const DUMMY_DIVISIONS = ['Motor Vehicle', 'Driver License'];

export default function CustomerWaitingListView() {
  const [divisions] = useState(DUMMY_DIVISIONS);

  return (
    <div className="fixed inset-0 z-20 flex bg-white">
      {divisions.map((division) => (
        <WaitingList key={division} division={division} />
      ))}
    </div>
  );
}
