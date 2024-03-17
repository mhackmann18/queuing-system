import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import app from 'utils/initFirebase';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { AuthContext } from './context';
import { useNavigate } from 'react-router-dom';
import { User } from 'utils/types';

/**
 * `AuthContextProvider` is a React component that provides an authentication context to its children.
 * It maintains the state of the current user and provides functions to log in and log out.
 *
 * @component
 * @param {Object} props The props that are passed to this component.
 * @param {ReactNode} props.children The child components over which this context provider will be applied.
 *
 * @returns {JSX.Element} Returns a `AuthContext.Provider` component that wraps the children, providing them access to the authentication context.
 *
 * @example
 * <AuthContextProvider>
 *   <YourComponent />
 * </AuthContextProvider>
 */
export default function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Check if the user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
      // If the user is logged in, set the user in state
      if (user) {
        const { email, displayName } = user;

        if (!email) {
          throw new Error('User does not have an id');
        }

        if (!displayName) {
          throw new Error('User does not have a display name');
        }

        setUser({
          username: displayName,
          email
        });

        // If the user is not logged in, set the user in state to null
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Logout user in firebase
  const logOut = useCallback(async () => {
    try {
      await signOut(getAuth(app));
    } catch (error) {
      console.error('Error signing out', error);
    }
  }, []);

  // Login user in firebase
  const login = async ({
    username,
    password
  }: {
    username: string;
    password: string;
  }) => {
    const response = await signInWithEmailAndPassword(
      getAuth(app),
      username,
      password
    );

    const { email, displayName } = response.user;

    if (!email) {
      throw new Error('User does not have an id');
    }

    if (!displayName) {
      throw new Error('User does not have a display name');
    }

    navigate('/dashboard');
  };

  return (
    <AuthContext.Provider value={{ user, login, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
