import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

// Fetch all playlists for a user
export const getAllPlaylists = async (userId) => {
  if (!userId) throw new Error("UID not provided");
  try {
    const playlistsRef = collection(db, "playlists", userId, "userPlaylists");
    const snapshot = await getDocs(playlistsRef);
    const playlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // console.log("📁 Playlists fetched:", playlists);
    return snapshot.docs.map((doc) => ({
      name: doc.id,
      songs: doc.data().songs || []
    }));
  } catch (error) {
    console.error("❌ Error fetching playlists:", error);
    if (error.code === 'permission-denied') {
      console.error("🔒 Permission Denied for playlists. userId:", userId);
    }
    return [];
  }
};

// Fetch songs from a playlist
export const getSongsFromPlaylist = async (userId, playlistName) => {
  if (!userId || !playlistName) return [];

  try {
    const docRef = doc(db, "playlists", userId, "userPlaylists", playlistName);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    const data = docSnap.data();
    return Array.isArray(data.songs) ? data.songs : [];
  } catch (error) {
    console.error("❌ Error fetching songs from playlist:", error);
    return [];
  }
};

// Add a song to an existing playlist
export const addSongToPlaylist = async (userId, playlistName, song) => {
  if (!userId || !playlistName || !song) return;
  try {
    const playlistRef = doc(db, "playlists", userId, "userPlaylists", playlistName);
    await updateDoc(playlistRef, { songs: arrayUnion(song) });
    // console.log(`➕ Added song to playlist ${playlistName}`);
  } catch (error) {
    console.error("❌ Error adding song to playlist:", error);
  }
};

// Create a new playlist and optionally add a song
export const createPlaylist = async (userId, playlistName, song) => {
  if (!userId || !playlistName) return;
  try {
    const playlistRef = doc(db, "playlists", userId, "userPlaylists", playlistName);
    const docSnap = await getDoc(playlistRef);
    if (docSnap.exists()) {
      console.warn(`Playlist "${playlistName}" already exists.`);
      return;
    }
    await setDoc(playlistRef, { songs: song ? [song] : [] });
    // console.log(`✅ Playlist "${playlistName}" created`);
  } catch (error) {
    console.error("❌ Error creating playlist:", error);
  }
};
