// src/RequireAuth.jsx
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        navigate("/", { replace: true });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return null;
  if (!user) return null;

  return children;
}



// // src/RequireAuth.jsx
// import { useEffect, useState } from "react";
// import { auth } from "./firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

// export default function RequireAuth({ children }) {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
      
//       if (!currentUser) {
//         // 1. Not logged in? Send to Sign In
//         navigate("/", { replace: true });
//       } else if (!currentUser.emailVerified) {
//         // 2. Logged in but NOT verified? Send to Verify Email page
//         navigate("/verify-email", { replace: true });
//       }
      
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   // While Firebase is checking the session, show a clean loader
//   if (loading) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
//         <p>Checking authentication...</p>
//       </div>
//     );
//   }

//   // Only render the Player/Favourites if the user exists AND is verified
//   return user && user.emailVerified ? children : null;
// }