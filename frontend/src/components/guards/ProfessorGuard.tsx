import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProfessorGuardProps {
  children: React.ReactNode;
}

const ProfessorGuard: React.FC<ProfessorGuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow SUPER_ADMIN to see everything, or explicitly PROFESSEUR
  if (user?.role !== 'PROFESSEUR' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />; // or to a forbidden page
  }

  return <>{children}</>;
};

export default ProfessorGuard;
