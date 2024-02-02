import CustomerManagerView from 'components/CustomerManagerView';
import { useEffect } from 'react';
import DummyApi from 'utils/CustomerController/DummyApi';

function App() {
  useEffect(() => {
    DummyApi.init();

    return () => {
      localStorage.clear();
    };
  }, []);
  return (
    <div className="text-eerie_black relative h-screen bg-white">
      <CustomerManagerView />
    </div>
  );
}

export default App;
