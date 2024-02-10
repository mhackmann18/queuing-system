import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="text-eerie_black relative bg-white">
      <Outlet />
    </div>
  );
}

export default App;
