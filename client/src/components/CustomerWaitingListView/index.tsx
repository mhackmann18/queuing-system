import { useState, useEffect } from 'react';
import WaitingList from './WaitingList';
import DummyApi from 'utils/CustomerController/DummyApi';
import './styles.css';

const DUMMY_DIVISIONS = ['Motor Vehicle', 'Driver License'];

export default function CustomerWaitingListView() {
  const [divisions, setDivisions] = useState(DUMMY_DIVISIONS);

  // Load initial customers
  useEffect(() => {
    localStorage.clear();
    DummyApi.init();
  }, []);

  return (
    <div className="flex">
      {divisions.map((division) => (
        <WaitingList key={division} division={division} />
      ))}
    </div>
  );
}
