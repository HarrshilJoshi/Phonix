import { setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";


export const likeSong = async (song) => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to like songs.");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    await setDoc(userRef, {
      likedSongs: arrayUnion({
        id: song.id,
        title: song.title || song.album,
        media_url: song.media_url || null,
        image: song.image,
        album: song.album,
        singers: song.singers || "Unknown",
        duration: song.duration || "0:00",
      }),
    }, { merge: true });
  } catch (error) {
    console.error("❌ Error liking song:", error);
  }
};

// export const unlikeSong = async (song) => {
//   const user = auth.currentUser;
//   if (!user) {
//     alert("Please login to unlike songs.");
//     return;
//   }

//   const userRef = doc(db, "users", user.uid);

//   try {
//     // We need to find the exact object in the array to remove it
//     const docSnap = await getDoc(userRef);
//     if (!docSnap.exists()) return;

//     const data = docSnap.data();
//     const likedSongs = data.likedSongs || [];
//     // Find the matching song by media_url
//     const songToRemove = likedSongs.find(
//       (s) => s.media_url === song.media_url
//     );

//     if (songToRemove) {
//       await setDoc(userRef, {
//         likedSongs: arrayRemove(songToRemove),
//       }, { merge: true });
//     }
//   } catch (error) {
//     console.error("❌ Error unliking song:", error);
//   }
// };


export const unlikeSong = async (song) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  try {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const likedSongs = docSnap.data().likedSongs || [];
    // Find the exact object currently stored in Firestore
    const songToRemove = likedSongs.find(s => (s.id && s.id === song.id) || (s.media_url && s.media_url === song.media_url));

    if (songToRemove) {
      // Use updateDoc instead of setDoc for better performance on updates
      await setDoc(userRef, {
        likedSongs: arrayRemove(songToRemove),
      }, { merge: true });
    }
  } catch (error) {
    console.error("❌ Error unliking song:", error);
  }
};










export const getLikedSongs = async (userId) => {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) {
    console.warn("getLikedSongs: No userId provided and no user logged in.");
    return [];
  }

  const userRef = doc(db, "users", uid);

  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.likedSongs || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching liked songs:", error);
    if (error.code === 'permission-denied') {
      console.error("🔒 Permission Denied for liked songs. uid:", uid);
    }
    return [];
  }
};
