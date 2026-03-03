// // // src/components/HomePage.jsx
// // import React, { useEffect, useState } from "react";
// // import { db } from "../firebase";
// // import {
// //   collection,
// //   getDocs,
// //   query,
// //   where,
// //   limit,
// //   doc,
// //   getDoc,
// // } from "firebase/firestore";
// // import SongList from "./SongList";
// // import "./HomePage.css";

// // export default function HomePage({
// //   userId,
// //   songs,
// //   showSearchResults,
// //   setActiveTab,
// //   likedSongs,
// //   toggleLike,
// //   handleMainPlay,
// //   currentSongIndex,
// //   isPlaying,
// //   audioRefs,
// // }) {
// //   const [topSongs, setTopSongs] = useState([]);
// //   const [latestSongs, setLatestSongs] = useState([]);
// //   const [recommended, setRecommended] = useState([]);
// //   const [favourites, setFavourites] = useState([]);
// //   const [playlists, setPlaylists] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {

// //     if (!userId) {
// //       console.warn("userId is undefined, skipping HomePage fetch");
// //       return;
// //     }

// //     if (!songs) {
// //       console.warn("songs from search are undefined, skipping song display");
// //       return;
// //     }

// //     const fetchData = async () => {
// //       try {
// //         // 🔥 Top Songs from API
// //         // const topSongsFromApi = [...songs]
// //         //   .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
// //         //   .slice(0, 10);
// //         // setTopSongs(topSongsFromApi);

// //         // // 🆕 Latest Songs from API
// //         // const latestSongsFromApi = [...songs]
// //         //   .sort(
// //         //     (a, b) =>
// //         //       new Date(b.release_date || 0).getTime() -
// //         //       new Date(a.release_date || 0).getTime()
// //         //   )
// //         //   .slice(0, 10);
// //         // setLatestSongs(latestSongsFromApi);

// //         // 🎤 Read liked songs from the user doc (array field, not subcollection)
// //         const userDocRef = doc(db, "users", userId);
// //         const userDocSnap = await getDoc(userDocRef);
// //         const likedSongsArray = userDocSnap.exists()
// //           ? userDocSnap.data().likedSongs || []
// //           : [];

// //         const singerSet = new Set();
// //         likedSongsArray.forEach((song) => {
// //           const s = song.singers;
// //           if (s) {
// //             s.split(",").forEach((name) => singerSet.add(name.trim()));
// //           }
// //         });

// //         const recs = [];
// //         for (let singer of singerSet) {
// //           try {
// //             const snap = await getDocs(
// //               query(collection(db, "songs"), where("singers", "==", singer), limit(5))
// //             );
// //             snap.forEach((d) => {
// //               const song = { id: d.id, ...d.data() };
// //               if (!recs.find((r) => r.id === song.id)) recs.push(song);
// //             });
// //           } catch (e) {
// //             // "songs" collection may not exist — that's fine
// //           }
// //         }
// //         setRecommended(recs);

// //         // ❤️ Favourites
// //         setFavourites(likedSongsArray);

// //         // 📁 Playlists
// //         const plSnap = await getDocs(collection(db, "playlists", userId, "userPlaylists"));
// //         setPlaylists(
// //           plSnap.docs.map((d) => ({
// //             id: d.id,
// //             name: d.data().name || d.id,
// //             songs: d.data().songs || [],
// //           }))
// //         );
// //       } catch (err) {
// //         console.error("Error loading homepage data:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchData();
// //   }, [userId, songs]);

// //   // const bindPlay = (list) => (index) => handleMainPlay(index, list);
// //   const bindPlay = (list) => (index) => {
// //     handleMainPlay(index, list);
// //     // now leave the HomePage panels so that the "main" SongList is rendered
// //     setActiveTab("");
// //   };

// //   if (loading) return <div className="loading">Loading music...</div>;

// //   // return (
// //   //   // <div className="home-page">

// //   //   <section className="section-wrapper">
// //   {/* <div className="section"> */ }
// //   /* <h2>🔥 Top Songs</h2>
// //   <div className="songlist-scrollable">



// //   <SongList
// //     songs={topSongs}
// //     likedSongs={likedSongs}
// //     toggleLike={toggleLike}
// //     handleMainPlay={bindPlay(topSongs)}
// //     currentSongIndex={currentSongIndex}
// //     isPlaying={isPlaying}
// //     audioRefs={audioRefs}
// //   />
// //   </div>
// //   </div>

// // <div className="section">
// //   <h2>🔁 Latest Releases</h2>
// //   <SongList
// //     songs={latestSongs}
// //     likedSongs={likedSongs}
// //     toggleLike={toggleLike}
// //     handleMainPlay={bindPlay(latestSongs)}
// //     currentSongIndex={currentSongIndex}
// //     isPlaying={isPlaying}
// //     audioRefs={audioRefs}
// //   />
// //   </div> */
// //   return (
// //     <section className="section-wrapper">
// //       {showSearchResults ? (
// //         // ✅ Only show search results when searching
// //         <SongList
// //           songs={songs}
// //           likedSongs={likedSongs}
// //           toggleLike={toggleLike}
// //           handleMainPlay={bindPlay(songs)}
// //           currentSongIndex={currentSongIndex}
// //           isPlaying={isPlaying}
// //           audioRefs={audioRefs}
// //         />
// //       ) : (
// //         <>
// //           {recommended.length > 0 && (
// //             <div className="section">
// //               <h2>🎺 Recommended Songs</h2>
// //               <SongList
// //                 songs={recommended}
// //                 likedSongs={likedSongs}
// //                 toggleLike={toggleLike}
// //                 handleMainPlay={bindPlay(recommended)}
// //                 currentSongIndex={currentSongIndex}
// //                 isPlaying={isPlaying}
// //                 audioRefs={audioRefs}
// //               />
// //             </div>
// //           )}

// //           {favourites.length > 0 && (
// //             <div className="section">
// //               <h2>❤️ Your Favourites</h2>
// //               <SongList
// //                 songs={favourites}
// //                 likedSongs={likedSongs}
// //                 toggleLike={toggleLike}
// //                 handleMainPlay={bindPlay(favourites)}
// //                 currentSongIndex={currentSongIndex}
// //                 isPlaying={isPlaying}
// //                 audioRefs={audioRefs}
// //               />
// //             </div>
// //           )}

// //           <h2>Your Playlists</h2>
// //           {playlists.length > 0 ? (
// //             playlists.map((pl) => (
// //               <div key={pl.id} className="playlist-card">
// //                 <h3>{pl.name}</h3>
// //                 <div className="playlist-songlist-scrollable">
// //                   <SongList
// //                     songs={pl.songs}
// //                     likedSongs={likedSongs}
// //                     toggleLike={toggleLike}
// //                     handleMainPlay={bindPlay(pl.songs)}
// //                     currentSongIndex={currentSongIndex}
// //                     isPlaying={isPlaying}
// //                     audioRefs={audioRefs}
// //                   />
// //                 </div>
// //               </div>
// //             ))
// //           ) : (
// //             <div className="empty-playlists">
// //               <img
// //                 src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
// //                 alt="No Playlists"
// //                 className="empty-playlists-icon"
// //               />
// //               <h2>🎵 Welcome to Your Music Space 🎧</h2>
// //               <p>
// //                 Start enjoying songs, explore new music, <br />
// //                 and build your own <strong>playlists</strong> & <strong>favourites</strong> ❤️
// //               </p>
// //             </div>

// //           )}
// //         </>
// //       )}
// //     </section>
// //   );
// // }











// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   limit,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import SongList from "./SongList";
// import "./HomePage.css";

// export default function HomePage({
//   userId,
//   songs,
//   showSearchResults,
//   setActiveTab,
//   likedSongs,
//   toggleLike,
//   handleMainPlay,
//   currentSongIndex,
//   isPlaying,
//   audioRefs,
// }) {
//   const [recommended, setRecommended] = useState([]);
//   const [favourites, setFavourites] = useState([]);
//   const [playlists, setPlaylists] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // At the top with other states
// const [isPreparing, setIsPreparing] = useState(false);

//   useEffect(() => {
//     // 🛡️ Guard: Wait for userId to be available from Player.jsx
//     if (!userId) {
//       return;
//     }

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // 1. Fetch Liked Songs (Favourites)
//         const userDocRef = doc(db, "users", userId);
//         const userDocSnap = await getDoc(userDocRef);
//         const likedSongsArray = userDocSnap.exists()
//           ? userDocSnap.data().likedSongs || []
//           : [];
//         setFavourites(likedSongsArray);

//         // 2. Simple Recommendation Engine (Based on singers of liked songs)
//         const singerSet = new Set();
//         likedSongsArray.forEach((song) => {
//           if (song.singers) {
//             song.singers.split(",").forEach((name) => singerSet.add(name.trim()));
//           }
//         });

//         const recs = [];
//         // Only get recommendations if user has liked something
//         if (singerSet.size > 0) {
//             for (let singer of Array.from(singerSet).slice(0, 3)) { // Limit to first 3 singers to avoid heavy DB hits
//                 const snap = await getDocs(
//                     query(collection(db, "songs"), where("singers", "==", singer), limit(5))
//                 );
//                 snap.forEach((d) => {
//                     const s = { id: d.id, ...d.data() };
//                     if (!recs.find((r) => r.id === s.id)) recs.push(s);
//                 });
//             }
//         }
//         setRecommended(recs);

//         // 3. Fetch Playlists
//         const plSnap = await getDocs(collection(db, "playlists", userId, "userPlaylists"));
//         setPlaylists(
//           plSnap.docs.map((d) => ({
//             id: d.id,
//             name: d.data().name || d.id,
//             songs: d.data().songs || [],
//           }))
//         );
//       } catch (err) {
//         console.error("Error loading homepage data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [userId]); // Only re-run when the actual userId changes

//   // Helper to handle playing from different sections
//   const bindPlay = (list) => (index) => {
//     handleMainPlay(index, list);
//     // If you want to keep the user on the current view, don't clear ActiveTab
//     // setActiveTab(""); 
//   };

//   if (!userId) return <div className="loading">Authenticating...</div>;
//   if (loading) return <div className="loading">Initializing your library...</div>;

//   return (
//     <section className="section-wrapper">
//       {showSearchResults ? (
//         <div className="section">
//            <h2>🔍 Search Results</h2>
//            <SongList
//             songs={songs}
//             likedSongs={likedSongs}
//             toggleLike={toggleLike}
//             handleMainPlay={bindPlay(songs)}
//             currentSongIndex={currentSongIndex}
//             isPlaying={isPlaying}
//             audioRefs={audioRefs}
//           />
//         </div>
//       ) : (
//         <>
//           {recommended.length > 0 && (
//             <div className="section">
//               <h2>🎺 Recommended for You</h2>
//               <SongList
//                 songs={recommended}
//                 likedSongs={likedSongs}
//                 toggleLike={toggleLike}
//                 handleMainPlay={bindPlay(recommended)}
//                 currentSongIndex={currentSongIndex}
//                 isPlaying={isPlaying}
//                 audioRefs={audioRefs}
//               />
//             </div>
//           )}

//           {favourites.length > 0 && (
//             <div className="section">
//               <h2>❤️ Your Favourites</h2>
//               <SongList
//                 songs={favourites}
//                 likedSongs={likedSongs}
//                 toggleLike={toggleLike}
//                 handleMainPlay={bindPlay(favourites)}
//                 currentSongIndex={currentSongIndex}
//                 isPlaying={isPlaying}
//                 audioRefs={audioRefs}
//               />
//             </div>
//           )}

//           <div className="section">
//             <h2>Your Playlists</h2>
//             {playlists.length > 0 ? (
//                 playlists.map((pl) => (
//                 <div key={pl.id} className="playlist-row">
//                     <h3>{pl.name}</h3>
//                     <SongList
//                         songs={pl.songs}
//                         likedSongs={likedSongs}
//                         toggleLike={toggleLike}
//                         handleMainPlay={bindPlay(pl.songs)}
//                         currentSongIndex={currentSongIndex}
//                         isPlaying={isPlaying}
//                         audioRefs={audioRefs}
//                     />
//                 </div>
//                 ))
//             ) : (
//                 <div className="empty-playlists">
//                 <img
//                     src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
//                     alt="No Playlists"
//                     className="empty-playlists-icon"
//                 />
//                 <h2>🎵 Start Your Collection 🎧</h2>
//                 <p>Search for songs and add them to your playlists or favourites!</p>
//                 </div>
//             )}
//           </div>
//         </>
//       )}
//     </section>
//   );
// }









import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import SongList from "./SongList";
import "./HomePage.css";
// Add these to your existing imports
import { auth } from "../firebase";
import { getRecommendations } from "../utils/recommendationEngine";

export default function HomePage({
  userId,
  songs,
  showSearchResults,
  setActiveTab,
  likedSongs,
  toggleLike,
  handleMainPlay,
  currentSongIndex,
  isPlaying,
  audioRefs,
  onAddToQueue,
}) {
  const [recommended, setRecommended] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
const [playHistory, setPlayHistory] = useState([]);
  // Track if the Telegram bot is currently "cooking" the MP3
  const [isPreparing, setIsPreparing] = useState(false);

  // useEffect(() => {
  //   // 🛡️ Step 1: Safety Guard
  //   // If Firebase hasn't given us a userId yet, don't do anything.
  //   if (!userId) return;

  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       // 1. Fetch User's Liked Songs (Favourites)
  //       const userDocRef = doc(db, "users", userId);
  //       const userDocSnap = await getDoc(userDocRef);
  //       const likedSongsArray = userDocSnap.exists()
  //         ? userDocSnap.data().likedSongs || []
  //         : [];
  //       setFavourites(likedSongsArray);

  //       // 2. Fetch User's Playlists from sub-collection
  //       const plSnap = await getDocs(collection(db, "playlists", userId, "userPlaylists"));
  //       setPlaylists(
  //         plSnap.docs.map((d) => ({
  //           id: d.id,
  //           name: d.data().name || d.id,
  //           songs: d.data().songs || [],
  //         }))
  //       );

  //       // ─── 3. Recommendation Engine (Artist Scoring Matrix + Trending API) ───
  //       const JIOSAAVN_API = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs";

  //       // Checklist of all liked songs: by id and by media_url (so we never recommend what you already have)
  //       const likedIds = new Set(likedSongsArray.map((s) => s.id).filter(Boolean));
  //       const likedMediaUrls = new Set(likedSongsArray.map((s) => s.media_url).filter(Boolean));
  //       if (likedSongs && typeof likedSongs === "object") {
  //         Object.keys(likedSongs).forEach((k) => {
  //           likedIds.add(k);
  //           likedMediaUrls.add(k);
  //         });
  //       }

  //       const isAlreadyLiked = (track) => {
  //         if (track.id && likedIds.has(track.id)) return true;
  //         const url = track.downloadUrl?.[4]?.link || track.downloadUrl?.[3]?.link || track.downloadUrl?.[2]?.link;
  //         if (url && likedMediaUrls.has(url)) return true;
  //         return false;
  //       };

  //       // Artist Scoring Matrix: from Liked Songs → count per artist → Top 3 absolute favorites
  //       const artistScores = {};
  //       likedSongsArray.forEach((song) => {
  //         if (song.singers) {
  //           song.singers.split(",").forEach((name) => {
  //             const artist = name.trim();
  //             if (artist) artistScores[artist] = (artistScores[artist] || 0) + 1;
  //           });
  //         }
  //       });
  //       const topArtists = Object.entries(artistScores)
  //         .sort((a, b) => b[1] - a[1])
  //         .slice(0, 3)
  //         .map((e) => e[0]);

  //       // Trending API Fetch: 15 most popular/trending songs per top artist (45 total), or platform-wide for new users
  //       let rawRecs = [];
  //       if (topArtists.length > 0) {
  //         for (const artist of topArtists) {
  //           try {
  //             const res = await fetch(`${JIOSAAVN_API}?query=${encodeURIComponent(artist)}&limit=15`);
  //             const data = await res.json();
  //             const results = data?.data?.results ?? data?.results ?? [];
  //             if (Array.isArray(results)) rawRecs = [...rawRecs, ...results];
  //           } catch (err) {
  //             console.error(`❌ Recommendations for artist "${artist}":`, err);
  //           }
  //         }
  //       } else {
  //         try {
  //           const res = await fetch(`${JIOSAAVN_API}?query=trending&limit=15`);
  //           const data = await res.json();
  //           const results = data?.data?.results ?? data?.results ?? [];
  //           if (Array.isArray(results)) rawRecs = results;
  //         } catch (err) {
  //           console.error("❌ Trending fallback:", err);
  //         }
  //       }

  //       // Smart Filtering: drop already-liked and duplicates; then Trending Sort by playCount
  //       const uniqueRecs = new Map();
  //       rawRecs.forEach((track) => {
  //         if (isAlreadyLiked(track) || uniqueRecs.has(track.id)) return;
  //         uniqueRecs.set(track.id, track);
  //       });

  //       const sorted = Array.from(uniqueRecs.values()).sort((a, b) => {
  //         const playA = parseInt(a.playCount, 10) || 0;
  //         const playB = parseInt(b.playCount, 10) || 0;
  //         return playB - playA;
  //       });

  //       // Instant Playback Prep: normalize to app shape + 320kbps direct URL
  //       const finalRecs = sorted.slice(0, 12).map((track) => {
  //         const media_url =
  //           track.downloadUrl?.[4]?.link || track.downloadUrl?.[3]?.link || track.downloadUrl?.[2]?.link || null;
  //         return {
  //           id: track.id,
  //           title: track.name,
  //           singers: track.primaryArtists ?? track.singers ?? "Unknown",
  //           album: track.album?.name || "Single",
  //           image: track.image?.[2]?.link || track.image?.[1]?.link,
  //           year: track.year,
  //           duration: track.duration,
  //           media_url,
  //         };
  //       });

  //       setRecommended(finalRecs);

  //     } catch (err) {
  //       console.error("❌ Error fetching Homepage data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [userId, Object.keys(likedSongs || {}).length]);



useEffect(() => {
  if (!userId) return;

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Doc (liked songs + play history)
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};

      const likedSongsArray = userData.likedSongs || [];
      const playHistoryArray = userData.playHistory || [];

      setFavourites(likedSongsArray);
      setPlayHistory(playHistoryArray);

      // 2. Fetch Playlists
      const plSnap = await getDocs(collection(db, "playlists", userId, "userPlaylists"));
      setPlaylists(
        plSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || d.id,
          songs: d.data().songs || [],
        }))
      );

      // 3. ── ML Recommendation Engine ──────────────────────────────────────
      const recs = await getRecommendations(likedSongsArray, playHistoryArray);

      // Normalize API shape → your app shape
      const finalRecs = recs.slice(0, 15).map((track) => {
        // Already normalized (from liked songs in Firebase)
        if (track.media_url) return track;

        // From JioSaavn API — normalize it
        const media_url =
          track.downloadUrl?.[4]?.link ||
          track.downloadUrl?.[3]?.link ||
          track.downloadUrl?.[2]?.link || null;

        return {
          id: track.id,
          title: track.name,
          name: track.name,
          singers: track.primaryArtists || track.singers || "Unknown",
          primaryArtists: track.primaryArtists || track.singers || "Unknown",
          featuredArtists: track.featuredArtists || "",
          album: track.album?.name || track.album || "Single",
          image: track.image?.[2]?.link || track.image?.[1]?.link || track.image?.[0]?.link,
          year: track.year,
          duration: track.duration,
          label: track.label,
          playCount: track.playCount,
          media_url,
        };
      });

      setRecommended(finalRecs);

    } catch (err) {
      console.error("❌ Error fetching Homepage data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [userId]);  // ✅ clean dependency — no more Object.keys hack




  // 🎵 Helper: When you click a song, this tells the Player to start the Telegram flow
  const bindPlay = (list) => async (index) => {
    setIsPreparing(true); // Start "Loading" visual
    await handleMainPlay(index, list);
    setIsPreparing(false); // End "Loading" visual
  };

  // --- UI RENDERING ---

  if (!userId) return <div className="loading-screen">Authenticating with Google...</div>;
  if (loading) return <div className="loading-screen">Loading your library...</div>;

  return (
    <section className="section-wrapper">
      {/* If a user is currently searching, show only Search Results */}
      {showSearchResults ? (
        <div className="section">
          <div className="section-header">
            <h2>🔍 Search Results</h2>
            {isPreparing && <span className="bot-status">🤖 Bot is preparing MP3...</span>}
          </div>
          <SongList
            songs={songs}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
            handleMainPlay={bindPlay(songs)}
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            audioRefs={audioRefs}
            onAddToQueue={onAddToQueue}
          />
        </div>
      ) : (
        <>
          {recommended.length > 0 && (
            <div className="section">
              <h2>🎺 Recommended for You</h2>
              <SongList
                songs={recommended}
                likedSongs={likedSongs}
                toggleLike={toggleLike}
                handleMainPlay={bindPlay(recommended)}
                currentSongIndex={currentSongIndex}
                isPlaying={isPlaying}
                audioRefs={audioRefs}
                onAddToQueue={onAddToQueue}
              />
            </div>
          )}

          {favourites.length > 0 && (
            <div className="section">
              <h2>❤️ Your Favourites</h2>
              <SongList
                songs={favourites}
                likedSongs={likedSongs}
                toggleLike={toggleLike}
                handleMainPlay={bindPlay(favourites)}
                currentSongIndex={currentSongIndex}
                isPlaying={isPlaying}
                audioRefs={audioRefs}
                onAddToQueue={onAddToQueue}
              />
            </div>
          )}

          <div className="section">
            <h2>Your Playlists</h2>
            {playlists.length > 0 ? (
              playlists.map((pl) => (
                <div key={pl.id} className="playlist-row">
                  <h3>{pl.name}</h3>
                  <SongList
                    songs={pl.songs}
                    likedSongs={likedSongs}
                    toggleLike={toggleLike}
                    handleMainPlay={bindPlay(pl.songs)}
                    currentSongIndex={currentSongIndex}
                    isPlaying={isPlaying}
                    audioRefs={audioRefs}
                    onAddToQueue={onAddToQueue}
                  />
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No playlists found. Start searching to add songs!</p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}