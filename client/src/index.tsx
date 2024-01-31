import { createRoot } from 'react-dom/client';
import 'tailwindcss/tailwind.css';
import App from 'App';
import UserContextProvider from 'components/UserContextProvider';

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

root.render(
  <UserContextProvider>
    <App />
  </UserContextProvider>
);
