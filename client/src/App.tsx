import CustomerManagerView from 'components/CustomerManagerView';
import { useEffect } from 'react';
import DummyApi from 'utils/CustomerController/DummyApi';

function App() {
  // TODO: Delete
  useEffect(() => {
    localStorage.clear();
    DummyApi.init();
  }, []);

  return (
    <div className="text-eerie_black relative h-screen bg-white">
      <CustomerManagerView />
    </div>
  );
}

export default App;
