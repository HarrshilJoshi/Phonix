// src/components/HomePage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import SongList from "./SongList";
import "./HomePage.css";
import { doc, getDoc } from "firebase/firestore";
import { getLikedSongs } from "../utils/likedSong.js";

export default function HomePage({
  userId,
  songs,
  likedSongs,
  toggleLike,
  handleMainPlay,
  currentSongIndex,
  isPlaying,
  audioRefs,

}) {
  const [fetchedLikedSongs1, setFetchedLikedSongs1] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("Songs received from search:", songs); // ✅ should now be array of 5
  }, [songs]);
  
  useEffect(() => {
  if (!userId) {
    // console.log("✅ userId in HomePage:", userId);

    console.warn("userId is undefined, skipping HomePage fetch");
    return;
  }

  if (!songs) {
    console.warn("songs from search are undefined, skipping song display");
    return;
  }
  console.log("✅ userId in HomePage:", userId);


  console.log("📦 Songs passed to HomePage:", songs);
  

  
    const fetchData = async () => {
      try {
        // 🔥 Fixed Top Songs query
        console.log("✅ userId in HomePage:", userId);

       const topSongsFromApi = [...songs]
  .sort((a, b) => b.play_count - a.play_count)
  .slice(0, 10);
setTopSongs(topSongsFromApi);

        // 🆕 Fixed Latest Releases query
      
        const latestSongsFromApi = [...songs]
  .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
  .slice(0, 10);
setLatestSongs(latestSongsFromApi);

        // 🎤 Fixed Recommended query
        // const likedSnap = await getDocs(collection(db, "users", userId, "likedSongs"));
        const likedSnap = await getDocs(collection(db, "users", userId, "likedSongs"));


likedSnap.forEach(d => {
  const data = d.data();
  console.log("❤️ Liked song:", data);
});
// console.log("📥 Liked songs count:", likedSnap.size);

        const singerSet = new Set();
        likedSnap.forEach(d => {
  const data = d.data();
  const s = data.singers;
  if (s) {
    s.split(",").forEach(name => singerSet.add(name.trim()));
  } else {
    console.warn("⚠️ No singers in liked song:", data);
  }
});

        const recs = [];
        for (let singer of singerSet) {
          const snap = await getDocs(
            query(
              collection(db, "songs"),
              where("singers", "==", singer),
              limit(5)
            )
          );
          snap.forEach(d => {
            const song = { id: d.id, ...d.data() };
            if (!recs.find(r => r.id === song.id)) recs.push(song);
          });
        }
        setRecommended(recs);
        console.log("🎤 Recommended songs count:", recs.length);


// export default HomePage;

 setFavourites(likedSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // 📁 Playlists
    const plSnap = await getDocs(collection(db, "playlists", userId, "userPlaylists"));
    setPlaylists(
      plSnap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.id,
        songs: d.data().songs || [],
      }))
    );
  } catch (err) {
    console.error("Error fetching homepage data:", err);
  } finally {
    setLoading(false);
  }
};


    fetchData();
  }, [userId]);

  // if (loading) return <div className="loading">Loading music...</div>;

  // Helper to bind play handler to a specific list
  const bindPlay = list => index => handleMainPlay(index, list);

  return (
    <div className="home-page">
      <h2>🔥 Top Songs</h2>
      <SongList
        songs={topSongs}
        likedSongs={likedSongs}
        toggleLike={toggleLike}
        handleMainPlay={bindPlay(topSongs)}
        currentSongIndex={currentSongIndex}
        isPlaying={isPlaying}
        audioRefs={audioRefs}
      />

      <h2>🆕 Latest Releases</h2>
      <SongList
        songs={latestSongs}
        likedSongs={likedSongs}
        toggleLike={toggleLike}
        handleMainPlay={bindPlay(latestSongs)}
        currentSongIndex={currentSongIndex}
        isPlaying={isPlaying}
        audioRefs={audioRefs}
      />

      <h2>🎤 More from Your Favourite Singers</h2>
      <SongList
        songs={recommended}
        likedSongs={likedSongs}
        toggleLike={toggleLike}
        handleMainPlay={bindPlay(recommended)}
        currentSongIndex={currentSongIndex}
        isPlaying={isPlaying}
        audioRefs={audioRefs}
      />

      {favourites.length > 0 && (
        <>
          <h2>❤️ Your Favourites</h2>
          <SongList
            songs={favourites}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
            handleMainPlay={bindPlay(favourites)}
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            audioRefs={audioRefs}
          />
        </>
      )}

      <h2>📁 Your Playlists</h2>
      {playlists.length ? (
        playlists.map(pl => (
          <div key={pl.id} className="playlist-card">
            <h3>{pl.name}</h3>
            <SongList
              songs={pl.songs}
              likedSongs={likedSongs}
              toggleLike={toggleLike}
              handleMainPlay={bindPlay(pl.songs)}
              currentSongIndex={currentSongIndex}
              isPlaying={isPlaying}
              audioRefs={audioRefs}
            />
          </div>
        ))
      ) : (
        <p>No playlists yet. Create one from the “+” menu.</p>
      )}
    </div>
  );
}




