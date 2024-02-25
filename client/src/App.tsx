import { Outlet } from 'react-router-dom';
import AuthContextProvider from 'components/ContextProviders/AuthContextProvider';

function App() {
  return (
    <div className="text-eerie_black relative bg-white">
      <AuthContextProvider>
        <Outlet />
      </AuthContextProvider>
    </div>
  );
}

export default App;
