import WaitingList from './WaitingList';
import useOffice from 'hooks/useOffice';
import './styles.css';

export default function CustomerWaitingListView() {
  const { divisionNames } = useOffice();

  return (
    <div className="fixed inset-0 z-20 flex bg-white">
      {divisionNames.map((division) => (
        <WaitingList key={division} division={division} />
      ))}
    </div>
  );
}
