import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import app from 'utils/initFirebase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

/**
 * `PrivateRoute` is a React component that provides a private route functionality.
 * It checks if the user is authenticated and if not, it redirects to the '/sign-in' route.
 * If the user is authenticated, it renders the child components.
 *
 * @component
 * @param {Object} props The props that are passed to this component.
 * @param {ReactElement} props.children The child components that this route will render if the user is authenticated.
 *
 * @returns {JSX.Element|null} Returns the child components if the user is authenticated, otherwise returns null.
 *
 * @example
 * <PrivateRoute>
 *   <YourComponent />
 * </PrivateRoute>
 */
export default function PrivateRoute({ children }: { children: ReactElement }) {
  // Default to true while we check if the user is authenticated
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  // Check if the user is authenticated when the component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
      // If the user is not authenticated, redirect to the sign-in page
      if (!user) {
        navigate('/sign-in');
      } else {
        // Will trigger a re-render and render the child components
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // TODO: Add loading indicator
  if (loading) {
    return null;
  }

  return children;
}
