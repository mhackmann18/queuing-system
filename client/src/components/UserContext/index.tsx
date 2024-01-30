import { createContext } from 'react';
import { User } from 'utils/types';

const UserContext = createContext<User>({ id: -1 });

export default UserContext;
