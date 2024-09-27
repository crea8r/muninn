import React, { useEffect } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import authService from 'src/services/authService';
import { useSpotLight } from 'src/contexts/SpotLightContext';

interface ProtectedRouteProps extends RouteProps {
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  ...rest
}) => {
  const { openSpotLight } = useSpotLight();
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSpotLight(['object', 'fact', 'task', 'creator']);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [openSpotLight]);

  if (!authService.isAuthenticated()) {
    return <Redirect to='/login' />;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    return <Redirect to='/no-permission' />;
  }
  return <Route {...rest} />;
};

export default ProtectedRoute;
