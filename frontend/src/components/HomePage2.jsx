
    //  const fetchData = async () => {
// //       try {
// //         // 🔥 Fixed Top Songs query
// //         const q1 = query(
// //           collection(db, "songs"),
// //           orderBy("play_count", "desc"),
// //           limit(10)
// //         );
// //         const topSnap = await getDocs(q1);
// //         setTopSongs(topSnap.docs.map(d => ({ id: d.id, ...d.data() })));

// //         // 🆕 Fixed Latest Releases query
// //         const q2 = query(
// //           collection(db, "songs"),
// //           orderBy("release_date", "desc"),
// //           limit(10)
// //         );
// //   useEffect(() => {
// //     if (!userId) return;

// //     const fetchData = async () => {
// //       try {
// //         // 🔥 Top Songs
// //         // const topSnap = await getDocs(
// //          console.log("Fetching top songs...");
// // const q1 = query(collection(db, "songs"), orderBy("play_count", "desc"), limit(10));
// // console.log("Query 1:", q1);
// // const topSnap = await getDocs(q1);

// //         // );
// //         setTopSongs(topSnap.docs.map(d => ({ id: d.id, ...d.data() })));

// //         // 🆕 Latest Releases
// //         const latestSnap = await getDocs(
// //           query(collection(db, "songs"), orderBy("release_date", "desc"), limit(10))
// //         );
// //         setLatestSongs(latestSnap.docs.map(d => ({ id: d.id, ...d.data() })));

// //         // 🎤 Recommended (from singers in likedSongs subcollection)
// //         const likedSnap = await getDocs(collection(db, "users", userId, "likedSongs"));
// //         const singerSet = new Set();
// //         likedSnap.forEach(d => {
// //           const s = d.data().singers;
// //           if (s) s.split(",").forEach(name => singerSet.add(name.trim()));
// //         });
// //         const recs = [];
// //         for (let singer of singerSet) {
// //           const snap = await getDocs(
// //             query(collection(db, "songs"), where("singers", "==", singer), limit(5))

// //           );
// //           snap.forEach(d => {
// //             const song = { id: d.id, ...d.data() };
// //             if (!recs.find(r => r.id === song.id)) recs.push(song);
// //           });
// //         }
// //         setRecommended(recs);

// //         // ❤️ Favourites
// //         setFavourites(likedSnap.docs.map(d => ({ id: d.id, ...d.data() })));

// //         // 📁 Your Playlists
// //         const plSnap = await getDocs(collection(db, "playlists", userId, "userPlaylists"));
// //         setPlaylists(
// //           plSnap.docs.map(d => ({
// //             id: d.id,
// //             name: d.data().name || d.id,
// //             songs: d.data().songs || [],
// //           }))
// //         );
// //       } catch (err) {
// //         console.error("Error fetching homepage data:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchData();
// //   }, [userId]);




// useEffect(() => {
//     const fetchSongs1 = async () => {
//       const songs = await getLikedSongs();
//       setFetchedLikedSongs1(songs);
//       console.log("favoruite songs  which is fetched in home page:" ,songs);
      
//     };
//     fetchSongs1();
//   }, []);




// const userDocRef = doc(db, "users", userId);
// const userSnap = await getDoc(userDocRef);

// if (userSnap.exists()) {
//   const userData = userSnap.data();
//   const likedSongs = userData.likedSongs || [];

//   const singerSet = new Set();
//   likedSongs.forEach(song => {
//     const singers = song.singers;
//     if (singers) {
//       singers.split(",").forEach(name => singerSet.add(name.trim()));
//     }
//   });

//   const recs = [];
//   for (let singer of singerSet) {
//     const snap = await getDocs(
//       query(
//         collection(db, "songs"),
//         where("singers", "==", singer),
//         limit(5)
//       )
//     );
//     snap.forEach(d => {
//       const song = { id: d.id, ...d.data() };
//       if (!recs.find(r => r.id === song.id)) {
//         recs.push(song);
//       }
//     });
//   }

//   setRecommended(recs);
//   console.log("🎤 Recommended songs count:", recs.length);
// }

















    //     // ❤️ Favourites
    //     setFavourites(likedSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    //     // 📁 Fixed Playlists query
    //     const plSnap = await getDocs(collection(db, "playlists", userId, "userPlaylists"));
    //     setPlaylists(
    //       plSnap.docs.map(d => ({
    //         id: d.id,
    //         name: d.data().name || d.id,
    //         songs: d.data().songs || [],
    //       }))
    //     );
    //   } catch (err) {
    //     console.error("Error fetching homepage data:", err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
  //    try {
  //     const likedSnapshot = await getDocs(collection(db, "users", userId, "likedSongs"));
  //     const likedSongsData = likedSnapshot.docs.map((doc) => doc.data());
  //     setLikedSongs(likedSongsData);
  //   } catch (error) {
  //     console.error("Error fetching liked songs:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


// // import PropTypes from "prop-types";

// // HomePage.propTypes = {
// //   userId: PropTypes.string,
// //   songs: PropTypes.array,
// //   likedSongs: PropTypes.array,
// //   toggleLike: PropTypes.func,
// //   handleMainPlay: PropTypes.func,
// //   currentSongIndex: PropTypes.number,
// //   isPlaying: PropTypes.bool,
// //   audioRefs: PropTypes.array,
// // };



















// import React, { useEffect, useState } from "react";
// import { auth, db } from "../firebase";
// import { collection, doc, getDoc, getDocs, query, where, limit } from "firebase/firestore";
// import SearchBar from "./SearchBar";
// import Playerbar from "./playerbar";
// import SideBar from "./sideBar";
// import "./player.css";
// import "./HomePage.css";
// import SongList from "./SongList";
// import PlayLists from "./PlayLists";

// const HomePage = () => {
//   const [favourites, setFavourites] = useState([]);
//   const [recommended, setRecommended] = useState([]);
//   const [playlists, setPlaylists] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userId = auth.currentUser?.uid;
//         if (!userId) return;
//         console.log("✅ userId in Player:", userId);

//         // Get user's liked songs from their user document
//         const userRef = doc(db, "users", userId);
//         const userSnap = await getDoc(userRef);

//         if (!userSnap.exists()) {
//           console.log("❌ No such user document!");
//           return;
//         }

//         const userData = userSnap.data();
//         const likedSongs = userData.likedSongs || [];
//         setFavourites(likedSongs);
//         console.log("📥 Liked songs count:", likedSongs.length);

//         // Fetch playlists from subcollection 'userPlaylists'
//         const playlistSnap = await getDocs(collection(db, "users", userId, "userPlaylists"));
//         const playlistArr = [];
//         playlistSnap.forEach((doc) => {
//           playlistArr.push({ id: doc.id, ...doc.data() });
//         });
//         setPlaylists(playlistArr);
//         console.log("📁 Playlists fetched:", playlistArr);

//         // Prepare recommendation based on singers in liked songs
//         const singerSet = new Set();
//         likedSongs.forEach((song) => {
//           const singers = song.singers;
//           if (singers) {
//             singers.split(",").forEach((singer) => singerSet.add(singer.trim()));
//           }
//         });

//         const recs = [];
//         for (let singer of singerSet) {
//           const snap = await getDocs(
//             query(collection(db, "songs"), where("singers", "==", singer), limit(5))
//           );
//           snap.forEach((docSnap) => {
//             const song = { id: docSnap.id, ...docSnap.data() };
//             if (!recs.find((r) => r.id === song.id)) {
//               recs.push(song);
//             }
//           });
//         }
//         setRecommended(recs);
//         console.log("🎤 Recommended songs count:", recs.length);
//       } catch (err) {
//         console.error("🔥 Error in HomePage:", err);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="main-page">
//       <SideBar />
//       <div className="content-section">
//         <SearchBar />

//         {favourites.length > 0 && (
//           <>
//             <h2>Liked Songs</h2>
//             <SongList songs={favourites}
//             likedSongs={{}} // Optional
//           toggleLike={() => {}}
//           handleMainPlay={(index) => handleMainPlay(index, fetchedLikedSongs)} // ⬅️ Updated
//           currentSongIndex={currentSongIndex}
//           isPlaying={isPlaying}
//           audioRefs={audioRefs} />
//           </>
//         )}

//         {recommended.length > 0 && (
//           <>
//             <h2>Recommended Songs</h2>
//             <SongList
//              songs={recommended}
//             //  songs={fetchedLikedSongs}
//           likedSongs={{}} // Optional
//           toggleLike={() => {}}
//           handleMainPlay={(index) => handleMainPlay(index, fetchedLikedSongs)} // ⬅️ Updated
//           currentSongIndex={currentSongIndex}
//           isPlaying={isPlaying}
//           audioRefs={audioRefs} />
//           </>
//         )}

//         {playlists.length > 0 && (
//           <>
//             <h2>Your Playlists</h2>
//             <PlayLists playlists={playlists} 
//             likedSongs={{}} // Optional
//           toggleLike={() => {}}
//           handleMainPlay={(index) => handleMainPlay(index, fetchedLikedSongs)} // ⬅️ Updated
//           currentSongIndex={currentSongIndex}
//           isPlaying={isPlaying}
//           audioRefs={audioRefs}/>
//           </>
//         )}
//       </div>

//       {/* <Playerbar /> */}
//     </div>
//   );
// };

// export default HomePage;




// import React, { useEffect, useState } from "react";
// import { collection, getDocs, query, where, limit ,orderBy } from "firebase/firestore";
// import {doc,getDoc} from "firebase/firestore";
// import { db } from "../firebase";
// import SongList from "./SongList";
// import "./HomePage.css";

// export default function HomePage({
//   userId,
//   songs,
//   showSearchResults,
//   Query,
//   likedSongs,
//   toggleLike,
//   handleMainPlay,
//   currentSongIndex,
//   isPlaying,
//   audioRefs,
// }) {
//   const [topSongs, setTopSongs] = useState([]);
//   const [latestSongs, setLatestSongs] = useState([]);
//   const [recommended, setRecommended] = useState([]);
//   const [favourites, setFavourites] = useState([]);
//   const [playlists, setPlaylists] = useState([]);
//   const [loading, setLoading] = useState(true);


//   // const [songs, setSongs] = useState([]);
// // const [loading, setLoading] = useState(true);
// // useEffect(() => {
// //   const fetchSongs = async () => {
// //     if (!Query) return;

// //     try {
// //       const res = await fetch(
// //         `https://saavnapi-nine.vercel.app/result/?query=${encodeURIComponent(query)}&lyrics=true`
// //       );
// //       const data = await res.json();
// //       // setSongs(data);
// //       setLoading(false);
// //     } catch (err) {
// //       console.error("Error fetching songs:", err);
// //     }
// //   };

// //   fetchSongs();
// // }, [query]);

// // useEffect(() => {
// //   const fetchData = async () => {
// //     try {
// //       if (!userId || !songs || songs.length === 0) {
// //         console.warn("Insufficient data to load homepage. Skipping fetch.");
// //         setLoading(false); // ✅ fix: stop loading screen
// //         return;
// //       }

// //       console.log("✅ userId in HomePage:", userId);
// //       console.log("📦 Songs passed to HomePage:", songs);

// //       // 🥇 Top Songs
// //       const top = [...songs]
// //         .sort((a, b) => b.play_count - a.play_count)
// //         .slice(0, 10);
// //       setTopSongs(top);

// //       // 🆕 Latest Releases
// //       const latest = [...songs]
// //         .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
// //         .slice(0, 10);
// //       setLatestSongs(latest);

// //       // ❤️ Favourites from Firestore
// //       const likedSnap = await getDocs(collection(db, "users", userId, "likedSongs"));
// //       const liked = likedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// //       setFavourites(liked);

// //       // 🎤 Recommended
// //       const singerSet = new Set();
// //       liked.forEach(song => {
// //         if (song.singers) {
// //           song.singers.split(",").forEach(name => singerSet.add(name.trim()));
// //         }
// //       });

// //       const recommendedSongs = songs.filter(song =>
// //         song.singers &&
// //         song.singers.split(",").some(name => singerSet.has(name.trim()))
// //       );
// //       setRecommended(recommendedSongs);

// //       // 📁 Playlists
// //       const plSnap = await getDocs(collection(db, "playlists", userId, "userPlaylists"));
// //       const pls = plSnap.docs.map(d => ({
// //         id: d.id,
// //         name: d.data().name || d.id,
// //         songs: d.data().songs || [],
// //       }));
// //       setPlaylists(pls);
// //     } catch (err) {
// //       console.error("🔥 Error fetching homepage data:", err);
// //     } finally {
// //       setLoading(false); // ✅ Ensure loading ends even on errors
// //     }
// //   };

// //   fetchData();
// // }, [userId, songs]);



//   useEffect(() => {
//     // Exit if no user or no songs
//     if (!userId) return;
    
//     // Handle case where we have search results
//     if (showSearchResults) {
//       setTopSongs([]);
//       setLatestSongs([]);
//       setRecommended([]);
//       setFavourites([]);
//       setPlaylists([]);
//       setLoading(false);
//       return;
//     }

//     // Only fetch homepage data if we're NOT showing search results
//     if (!showSearchResults && songs.length === 0) {
//       const fetchHomeData = async () => {
//         try {
//           // 🔥 Fetch Top Songs (10 most played)
//           if (!songs || songs.length === 0) {
//           setLoading(false);
//           return;
//         }

//         // 1. Top Songs (based on play_count)
//         const top = [...songs]
//           .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
//           .slice(0, 10);
//         setTopSongs(top);

//         // 2. Latest Releases (based on release_date)
//         const latest = [...songs]
//           .sort((a, b) => 
//             new Date(b.release_date || 0) - new Date(a.release_date || 0)
//           )
//           .slice(0, 10);
//         setLatestSongs(latest);
        

//           const latestSnap = await getDocs(latestQuery);
//           setLatestSongs(latestSnap.docs.map(d => ({ id: d.id, ...d.data() })));

//           // ❤️ Fetch Favorites
//           const userRef = doc(db, "users", userId);
//           const userSnap = await getDoc(userRef);
          
//           if (userSnap.exists()) {
//             const likedSongs = userSnap.data().likedSongs || [];
//             setFavourites(likedSongs);
            
//             // 🎤 Recommended based on singers
//             const singerSet = new Set();
//             likedSongs.forEach(song => {
//               song.singers?.split(",").forEach(singer => 
//                 singerSet.add(singer.trim())
//               );
//             });
            
//             const recs = [];
//             for (const singer of singerSet) {
//               const singerQuery = query(
//                 collection(db, "songs"),
//                 where("singers", "array-contains", singer),
//                 limit(3)
//               );
//               const snap = await getDocs(singerQuery);
//               snap.docs.forEach(doc => {
//                 const song = { id: doc.id, ...doc.data() };
//                 if (!recs.some(s => s.id === song.id)) recs.push(song);
//               });
//             }
//             setRecommended(recs);
//           }

//           // 📁 Fetch Playlists
//           const playlistsQuery = query(
//             collection(db, "users", userId, "userPlaylists")
//           );
//           const playlistSnap = await getDocs(playlistsQuery);
//           const playlistsData = playlistSnap.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//           }));
//           setPlaylists(playlistsData);

//         } catch (err) {
//           console.error("Homepage data error:", err);
//         } finally {
//           setLoading(false);
//         }
//       };
      
//       fetchHomeData();
//     }
//   }, [userId, songs, showSearchResults]);

// // Inside HomePage's return statement
// if (showSearchResults) {
//   return (
//     <div className="home-page">
//       <h2>🔍 Search Results</h2>
//       <SongList
//         songs={songs}
//         likedSongs={likedSongs}
//         toggleLike={toggleLike}
//         handleMainPlay={bindPlay(songs)}
//         currentSongIndex={currentSongIndex}
//         isPlaying={isPlaying}
//         audioRefs={audioRefs}
//       />
//     </div>
//   );
// }

// if (loading) return <div className="loading">Loading music...</div>;

// // ...existing section rendering code



//   const bindPlay = list => index => handleMainPlay(index, list);

//   if (loading) return <div className="loading">Loading music...</div>;

//   return (
//     <div className="home-page">
//       <h2>🔥 Top Songs</h2>
//       <SongList
//         songs={topSongs}
//         likedSongs={likedSongs}
//         toggleLike={toggleLike}
//         handleMainPlay={bindPlay(topSongs)}
//         currentSongIndex={currentSongIndex}
//         isPlaying={isPlaying}
//         audioRefs={audioRefs}
//       />

//       <h2>🆕 Latest Releases</h2>
//       <SongList
//         songs={latestSongs}
//         likedSongs={likedSongs}
//         toggleLike={toggleLike}
//         handleMainPlay={bindPlay(latestSongs)}
//         currentSongIndex={currentSongIndex}
//         isPlaying={isPlaying}
//         audioRefs={audioRefs}
//       />

//       {recommended.length > 0 && (
//         <>
//           <h2>🎤 More from Your Favourite Singers</h2>
//           <SongList
//             songs={recommended}
//             likedSongs={likedSongs}
//             toggleLike={toggleLike}
//             handleMainPlay={bindPlay(recommended)}
//             currentSongIndex={currentSongIndex}
//             isPlaying={isPlaying}
//             audioRefs={audioRefs}
//           />
//         </>
//       )}

//       {favourites.length > 0 && (
//         <>
//           <h2>❤️ Your Favourites</h2>
//           <SongList
//             songs={favourites}
//             likedSongs={likedSongs}
//             toggleLike={toggleLike}
//             handleMainPlay={bindPlay(favourites)}
//             currentSongIndex={currentSongIndex}
//             isPlaying={isPlaying}
//             audioRefs={audioRefs}
//           />
//         </>
//       )}

//       <h2>📁 Your Playlists</h2>
//       {playlists.length > 0 ? (
//         playlists.map(pl => (
//           <div key={pl.id} className="playlist-card">
//             <h3>{pl.name}</h3>
//             <SongList
//               songs={pl.songs}
//               likedSongs={likedSongs}
//               toggleLike={toggleLike}
//               handleMainPlay={bindPlay(pl.songs)}
//               currentSongIndex={currentSongIndex}
//               isPlaying={isPlaying}
//               audioRefs={audioRefs}
//             />
//           </div>
//         ))
//       ) : (
//         <p>No playlists yet. Create one from the “+” menu.</p>
//       )}
//     </div>
//   );
// }
















import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import SongList from "./SongList";
import "./HomePage.css";

export default function HomePage({
  userId,
  songs,   
  showSearchResults,     // ← the full array of songs you fetched from your API
  likedSongs,
  toggleLike,
  handleMainPlay,
  currentSongIndex,
  isPlaying,
  audioRefs,
}) {
  const [topSongs, setTopSongs] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("hello");
        // DERIVE Top & Latest from the `songs` prop
        if (Array.isArray(songs) && songs.length > 0) {
          console.log("hello inside the box");
          const copy=[...songs];
          console.log(...copy);
          // Top by play_count
          const top = copy
            .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
            .slice(0, 10);
          setTopSongs(top);

          // Latest by release_date
          const latest = [...songs]
            .sort(
              (a, b) =>
                new Date(b.release_date).getTime() -
                new Date(a.release_date).getTime()
            )
            .slice(0, 10);
          setLatestSongs(latest);
        }

        if (userId) {
          // — Favourites from Firestore
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          let favs = [];
          if (userSnap.exists()) {
            favs = userSnap.data().likedSongs || [];
            setFavourites(favs);
          }

          // — Recommendations by singer
          const singerSet = new Set();
          favs.forEach((s) => {
            if (s.singers) {
              s.singers.split(",").forEach((name) =>
                singerSet.add(name.trim())
              );
            }
          });
          const recs = [];
          for (let singer of singerSet) {
            // filter from your existing `songs` array
            songs
              .filter(
                (song) =>
                  song.singers
                    ?.split(",")
                    .map((n) => n.trim())
                    .includes(singer)
              )
              .slice(0, 5)
              .forEach((song) => {
                if (!recs.find((r) => r.id === song.id)) recs.push(song);
              });
          }
          setRecommended(recs);

          // — Playlists
          const plSnap = await getDocs(
            collection(db, "users", userId, "userPlaylists")
          );
          setPlaylists(
            plSnap.docs.map((d) => ({
              id: d.id,
              name: d.data().name || d.id,
              songs: d.data().songs || [],
            }))
          );
        }
      } catch (err) {
        console.error("Error loading homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, songs]);

  const bindPlay = (list) => (index) => handleMainPlay(index, list);

  if (loading) return <div className="loading">Loading music...</div>;

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

      {recommended.length > 0 && (
        <>
          <h2>🎤 Recommended Songs</h2>
          <SongList
            songs={recommended}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
            handleMainPlay={bindPlay(recommended)}
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            audioRefs={audioRefs}
          />
        </>
      )}

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
      {playlists.length > 0 ? (
        playlists.map((pl) => (
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



