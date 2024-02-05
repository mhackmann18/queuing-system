import CustomerManagerView from 'components/CustomerManagerView';
// import CustomerWaitingListView from 'components/CustomerWaitingListView';

function App() {
  return (
    <div className="text-eerie_black relative h-screen bg-white">
      {/* <CustomerWaitingListView /> */}
      <CustomerManagerView />
    </div>
  );
}

export default App;
