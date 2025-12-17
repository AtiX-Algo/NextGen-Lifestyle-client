import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  // 1. Get user data from LocalStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. Check: Is there a user? Is the role 'admin'?
  if (user && user.role === 'admin') {
    return children; // ✅ Authorized: Render the Admin Page
  }

  // 3. ❌ Not Authorized? Redirect to Dashboard (or Login)
  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;