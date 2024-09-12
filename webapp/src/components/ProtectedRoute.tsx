import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps extends RouteProps {
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  ...rest
}) => {
  if (!authService.isAuthenticated()) {
    return <Redirect to='/login' />;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    return <Redirect to='/no-permission' />;
  }

  return <Route {...rest} />;
};

export default ProtectedRoute;
