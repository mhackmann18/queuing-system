// import CustomerManagerView from 'components/CustomerManagerView';
import CustomerWaitingListView from 'components/CustomerWaitingListView';
// import CustomerCheckInView from 'components/CustomerCheckInView';

function App() {
  return (
    <div className="text-eerie_black relative h-screen bg-white">
      <CustomerWaitingListView />
      {/* <CustomerCheckInView /> */}
      {/* <CustomerManagerView /> */}
    </div>
  );
}

export default App;
