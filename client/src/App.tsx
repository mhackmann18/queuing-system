import { Outlet } from 'react-router-dom';
import AuthContextProvider from 'components/ContextProviders/AuthContextProvider';
import OfficeContextProvider from 'components/ContextProviders/OfficeContextProvider';

function App() {
  return (
    <div className="text-eerie_black relative bg-white">
      <AuthContextProvider>
        <OfficeContextProvider>
          <Outlet />
        </OfficeContextProvider>
      </AuthContextProvider>
    </div>
  );
}

export default App;
