import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  // 🛡️ Logic: If no user, or email not verified, kick them to login
  if (!user || !user.emailVerified) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;