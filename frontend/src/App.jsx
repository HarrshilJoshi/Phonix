// import { Routes, Route } from 'react-router-dom';
// import SignIn from './components/SignIn';
// import Player from './components/Player';
// import Favourites from './components/favourites';
// import RequireAuth from './RequireAuth';
// import { Navigate } from "react-router-dom";
// import { auth } from "./firebase";

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<SignIn />} />
//       <Route
//         path="/player"
//         element={
//           <RequireAuth>
//             <Player />
//           </RequireAuth>
//         }
//       />
//       <Route
//         path="/favourites"
//         element={
//           <RequireAuth>
//             <Favourites />
//           </RequireAuth>
//         }
//       />
//     </Routes>
//   );
// }

// export default App;







import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
// import SignUp from './components/SignUp';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import Player from './components/Player';
import Favourites from './components/favourites';
import RequireAuth from './RequireAuth';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* /home and /player go to app; protect so only logged-in users can access */}
      <Route path="/home" element={<Navigate to="/player" replace />} />
      <Route path="/player" element={<RequireAuth><Player /></RequireAuth>} />
      <Route path="/favourites" element={<RequireAuth><Favourites /></RequireAuth>} />
    </Routes>
  );
}
export default App;