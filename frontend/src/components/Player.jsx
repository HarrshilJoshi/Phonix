import { useState, useRef, useEffect } from "react";
import SideBar from "./sideBar.jsx";
import SearchBar from "./SearchBar.jsx";
import { Play, User } from "lucide-react";
import "./player.css";
import Playerbar from "./playerbar";
import DotGrid from "./DotGrid.jsx";
import SongList from "./SongList.jsx";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { likeSong, unlikeSong } from "../utils/likedSong.js";
import Favourites from "./favourites.jsx";
import Playlists from "./PlayLists.jsx";
import { getAllPlaylists } from "../utils/PlaylistUtils.js";
import HomePage from "./HomePage.jsx";
// import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
// import { updateDoc, arrayUnion } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, updateDoc, arrayUnion } from "firebase/firestore";
function Player() {
  const [songs, setSongs] = useState([]);
  const [visibleLyrics, setVisibleLyrics] = useState({});
  const [likedSongs, setLikedSongs] = useState({});
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRefs = useRef([]);
  const pollIntervalRef = useRef(null);
  const persistentAudioRef = useRef(new Audio());
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [showPlayList, setshowPlayList] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [showFavourites, setShowFavourites] = useState(false);
  const [userId, setUserId] = useState(null);
  const [Query, setQuery] = useState("");


  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [playingSongs, setPlayingSongs] = useState([]);
  const [playingSongIndex, setPlayingSongIndex] = useState(null);
  const [queue, setQueue] = useState([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsText, setLyricsText] = useState(null);
  // Add these near your other useState declarations (~line 35)
  const [syncedLyrics, setSyncedLyrics] = useState([]); // parsed [{time, text}] array
  const [lyricsMode, setLyricsMode] = useState("plain"); // "synced" | "plain"
  // ✅ Toggle open/close
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // ✅ Force close
  const closeSidebar = () => setIsSidebarOpen(false);
  const handleSearchResults = (results) => {
    setSongs(results);
    setActiveTab("search");
    setShowSearchResults(true);
  };

  const addToQueue = (song) => {
    if (!song) return;
    setQueue((q) => [...q, song]);
  };

  const handleNextFromPlayer = () => {
    if (queue.length > 0) {
      const [nextSong, ...rest] = queue;
      setQueue(rest);
      setPlayingSongs([nextSong, ...rest]);
      setPlayingSongIndex(0);
      handleMainPlay(0, [nextSong, ...rest]);
    } else {
      const nextIndex = (playingSongIndex + 1) % Math.max(playingSongs.length, 1);
      handleMainPlay(nextIndex, playingSongs);
    }
  };

  const handlePrevFromPlayer = () => {
    const prevIndex = (playingSongIndex - 1 + playingSongs.length) % Math.max(playingSongs.length, 1);
    handleMainPlay(prevIndex, playingSongs);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 200);
      } else {
        setUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const currentPlayingSong = playingSongIndex !== null && playingSongs[playingSongIndex] ? playingSongs[playingSongIndex] : null;
useEffect(() => {
  if (!showLyrics || !currentPlayingSong?.id) {
    setLyricsText(null);
    setSyncedLyrics([]);
    setLyricsMode("plain");
    return;
  }

  setLyricsText(null);
  setSyncedLyrics([]);
  setLyricsMode("plain");

  const id = currentPlayingSong.id;
  const apiBase = "https://jiosaavn-api-privatecvc2.vercel.app";
  const artistName = currentPlayingSong.primaryArtists?.split(",")?.[0]?.trim()
    || currentPlayingSong.singers?.split(",")?.[0]?.trim() || "";
  const songName = currentPlayingSong.name || currentPlayingSong.title || "";
  const duration = parseInt(currentPlayingSong.duration) || 200;

  const parseLRC = (lrcString) => {
    return lrcString.split("\n").map((line) => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (!match) return null;
      const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
      const text = match[3].trim();
      return text ? { time, text } : null;
    }).filter(Boolean);
  };

// const trackPlayedSong = async (song) => {
//   const user = auth.currentUser;
//   if (!user || !song?.id) return;
//   try {
//     const docRef = doc(db, "users", user.uid);
//     await updateDoc(docRef, {
//       playHistory: arrayUnion({
//         id: song.id,
//         name: song.name || song.title,
//         primaryArtists: song.primaryArtists || song.singers || "",
//         featuredArtists: song.featuredArtists || "",
//         album: song.album?.name || song.album || "",
//         playedAt: Date.now(),
//       })
//     });
//   } catch (err) {
//     console.error("❌ trackPlayedSong failed:", err);
//   }
// };

  const fetchAISync = async (plainLyrics) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `This song is ${duration} seconds long.
Here are the lyrics:
${plainLyrics}

Distribute timestamps naturally based on typical singing pace.
Return ONLY a JSON array, no explanation, no markdown:
[{"time": 12.5, "text": "first lyric line"},{"time": 16.2, "text": "second line"}]`
          }]
        })
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch (err) {
      console.error("❌ AI sync failed:", err);
      return null;
    }
  };

  const loadLyrics = async () => {
    // 🥇 Step 1: Try LRCLIB for real synced lyrics
    try {
      const lrcRes = await fetch(
        `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(songName)}&duration=${duration}`
      );
      if (lrcRes.ok) {
        const lrcData = await lrcRes.json();
        if (lrcData.syncedLyrics) {
          console.log("✅ LRCLIB synced lyrics found");
          const parsed = parseLRC(lrcData.syncedLyrics);
          if (parsed.length > 0) {
            setSyncedLyrics(parsed);
            setLyricsMode("synced");
            setLyricsText(null);
            return; // done!
          }
        }
      }
    } catch (err) {
      console.warn("LRCLIB unavailable:", err);
    }




// const trackPlayedSong = async (song) => {
//   const user = auth.currentUser;
//   if (!user || !song?.id) return;

//   const docRef = doc(db, "users", user.uid);
//   await updateDoc(docRef, {
//     playHistory: arrayUnion({
//       id: song.id,
//       name: song.name || song.title,
//       primaryArtists: song.primaryArtists || song.singers,
//       album: song.album?.name || song.album,
//       playedAt: Date.now()   // timestamp for recency weighting later
//     })
//   });
// };

    // 🥈 Step 2: Fetch plain lyrics from JioSaavn
    let plainLyrics = "";
    try {
      const res = await fetch(`${apiBase}/lyrics?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        plainLyrics = data?.lyrics ?? data?.data?.lyrics ?? data?.text ?? "";
      }
    } catch (err) {
      console.warn("JioSaavn lyrics fetch failed:", err);
    }

    if (!plainLyrics) {
      setLyricsText("Lyrics not available.");
      setLyricsMode("plain");
      return;
    }

    // 🥉 Step 3: Try AI to estimate timestamps from plain lyrics
    const aiSynced = await fetchAISync(plainLyrics);
    if (aiSynced && aiSynced.length > 0) {
      console.log("✅ AI estimated sync applied");
      setSyncedLyrics(aiSynced);
      setLyricsMode("synced");
      setLyricsText(null);
    } else {
      // 🏳️ Fallback: plain lyrics
      setLyricsText(typeof plainLyrics === "string" ? plainLyrics : "");
      setLyricsMode("plain");
    }
  };

  loadLyrics();
}, [showLyrics, currentPlayingSong?.id]);

  // / Just to see what's going on
  useEffect(() => {
    if ('mediaSession' in navigator && currentPlayingSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentPlayingSong.title || currentPlayingSong.song || 'Unknown Title',
        artist: currentPlayingSong.primary_artists || currentPlayingSong.singers || 'Unknown Artist',
        album: currentPlayingSong.album || '',
        artwork: [
          { src: currentPlayingSong.image || currentPlayingSong.image_url || '/icons/Phonix192x192.png', sizes: '192x192', type: 'image/png' },
          { src: currentPlayingSong.image || currentPlayingSong.image_url || '/icons/Phonix512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevFromPlayer();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextFromPlayer();
      });
    }
  }, [currentPlayingSong, isPlaying, handlePrevFromPlayer, handleNextFromPlayer]);

  useEffect(() => {
    console.log("✅ userId in Player state:", userId);
  }, [userId]);

  useEffect(() => {
    // console.log("🎵 Songs received from search:", songs);
  }, [songs]);



  // useEffect(() => {
  //   if (currentSongIndex !== null && audioRefs.current[currentSongIndex]) {
  //     const audio = audioRefs.current[currentSongIndex];
  //     if (isPlaying) {
  //       audio.play().catch((err) => console.error("Play failed:", err));
  //     } else {
  //       audio.pause();
  //     }
  //   }
  // }, [currentSongIndex, isPlaying]);


  // ✅ Find this block in Player.jsx and update it to this:
  // useEffect(() => {
  //   if (currentSongIndex !== null && audioRefs.current[currentSongIndex]) {
  //     const audio = audioRefs.current[currentSongIndex];

  //     // Only attempt to play if we have a valid source URL from the Telegram bot
  //     if (isPlaying && audio.src && audio.src !== window.location.href) {
  //       audio.play().catch((err) => {
  //         // This catch block prevents the console error while the bot is still "cooking" the MP3
  //         console.warn("Playback is waiting for the Telegram bot to finish...");
  //       });
  //     } else {
  //       audio.pause();
  //     }
  //   }
  // }, [currentSongIndex, isPlaying]);



  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = persistentAudioRef.current;
    if (!audio) return;
    if (isPlaying && audio.src && audio.src !== window.location.href) {
      audio.play().catch(() => console.warn("Waiting for audio..."));
    } else if (!isPlaying) {
      audio.pause();
    }
  }, [currentSongIndex, isPlaying]);










  // useEffect(() => {
  //   const fetchLikedSongs = async () => {
  //     const user = auth.currentUser;
  //     if (!user) return;

  //     const docRef = doc(db, "users", user.uid);
  //     const docSnap = await getDoc(docRef);

  //     if (!docSnap.exists()) return;

  //     const liked = docSnap.data().likedSongs || [];
  //     const newLikedMap = {};
  //     songs.forEach((song) => {
  //       if (liked.some((s) => s.media_url === song.media_url)) {
  //         newLikedMap[song.media_url] = true;
  //       }
  //     });
  //     setLikedSongs(newLikedMap);
  //   };

  //   fetchLikedSongs();
  // }, [songs]);



  // useEffect(() => {
  //   console.log("Songs received from search:", songs);
  // }, [songs]);



  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       const docRef = doc(db, "users", user.uid);
  //       const docSnap = await getDoc(docRef);

  //       if (docSnap.exists()) {
  //         const data = docSnap.data();
  //         const liked = data.likedSongs || [];
  //         const newLikedMap = {};
  //          if (Array.isArray(songs)) {
  //   songs.forEach((song, index) => {
  //     if (liked.some((s) => s.media_url === song.media_url)) {
  //       newLikedMap[index] = true;
  //     }
  //   });
  // }
  //         setLikedSongs(newLikedMap);
  //         setUserPlaylists(data.playlists || []);
  //       } else {
  //         setLikedSongs({});
  //         setUserPlaylists([]);
  //       }
  //     } else {
  //       setLikedSongs({});
  //       setUserPlaylists([]);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [songs]);



  // ✅ Fetch fully liked songs map on auth state changed (runs once on mount)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const liked = data.likedSongs || [];
          setUserPlaylists(data.playlists || []);

          // ✅ Set liked songs map containing all currently liked songs
          const newLikedMap = {};
          liked.forEach((song) => {
            const key = song.id || song.media_url;
            if (key) {
              newLikedMap[key] = true;
            }
          });
          setLikedSongs(newLikedMap);
        } else {
          setLikedSongs({});
          setUserPlaylists([]);
        }
      } else {
        setLikedSongs({});
        setUserPlaylists([]);
      }
    });

    return () => unsubscribe();
  }, []); // ✅ Run once


  // useEffect(() => {
  //   fetch('/api/hello')
  //     .then(res => {
  //       // Check if the response is actually a 200 OK before parsing JSON
  //       if (!res.ok) {
  //         throw new Error(`Server responded with status ${res.status}`);
  //       }
  //       return res.json();
  //     })
  //     .then(data => {
  //       console.log("🌐 Serverless Function Response:", data.message);
  //     })
  //     .catch(err => {
  //       // This will now catch both the 500 error and the JSON parse error gracefully
  //       console.warn("API call failed (expected if local server isn't running):", err.message);
  //     });
  // }, []);

  // (Removed old updateLikedMap useEffect here as we track it globally)

  // const [songs, setSongs] = useState([]);

  // const handleSearchResults = (data) => {
  //   console.log("Fetched search data:", data); // ✅ 5 items here
  //   setSongs(data); // 👈 This must run correctly
  // };

  // <SearchBar onResults={handleSearchResults} />




  const toggleLyrics = (index) => {
    setVisibleLyrics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };


  const toggleLike = async (song) => {
    if (!song) return;

    const key = song.id || song.media_url || song.title; // use id as primary key
    const isCurrentlyLiked = likedSongs[key];

    setLikedSongs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    if (isCurrentlyLiked) {
      await unlikeSong(song); // remove from Firebase
    } else {
      await likeSong(song); // add to Firebase
    }
  };


  const trackPlayedSong = async (song) => {
  const user = auth.currentUser;
  if (!user || !song?.id) return;
  try {
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, {
      playHistory: arrayUnion({
        id: song.id,
        name: song.name || song.title,
        primaryArtists: song.primaryArtists || song.singers || "",
        featuredArtists: song.featuredArtists || "",
        album: song.album?.name || song.album || "",
        playedAt: Date.now(),
      })
    });
  } catch (err) {
    console.error("❌ trackPlayedSong failed:", err);
  }
};
  const handleHomeClick = () => {
    // setShowSearch(false);
    setshowPlayList(false);
    setShowFavourites(false);
    // setSongs([]);

  };

  // const handleMainPlay = (index, sourceSongs) => {
  //   const newSongs = sourceSongs || songs;

  //   if (index === currentSongIndex) {
  //     setIsPlaying((prev) => !prev);
  //   } else {
  //     audioRefs.current.forEach((ref) => {
  //       if (ref) {
  //         ref.pause();
  //         ref.currentTime = 0;
  //       }
  //     });
  //     setCurrentSongIndex(index);
  //     if (sourceSongs) {
  //       setSongs(sourceSongs); // ✅ Only set songs if a new list is passed
  //     }
  //     setIsPlaying(true);
  //   }
  // };




  // const handleMainPlay = async (index, sourceSongs) => {
  //   const currentList = sourceSongs || songs;
  //   const selectedSong = currentList[index];

  //   // 1. If it's the same song, just toggle play/pause
  //   if (index === currentSongIndex) {
  //     setIsPlaying((prev) => !prev);
  //     return;
  //   }

  //   // 2. Stop any current audio
  //   audioRefs.current.forEach((ref) => {
  //     if (ref) {
  //       ref.pause();
  //       ref.currentTime = 0;
  //     }
  //   });

  //   // 3. Set basic state
  //   setCurrentSongIndex(index);
  //   if (sourceSongs) setSongs(sourceSongs);

  //   // 4. Talk to the Saadhna MP3 Server
  //   const SERVER_URL = "http://localhost:3000";
  //   try {
  //     // Trigger the compilation
  //     const addRes = await fetch(`${SERVER_URL}/add?id=${selectedSong.id}`);
  //     const addData = await addRes.json();

  //     if (addData.status === "success" || addData.message?.includes("already")) {
  //       // Start polling for status
  //       const pollInterval = setInterval(async () => {
  //         const statusRes = await fetch(`${SERVER_URL}/status?id=${selectedSong.id}`);
  //         const statusData = await statusRes.json();

  //         if (statusData.status === "completed") {
  //           clearInterval(pollInterval);

  //           // Inject the new MP3 URL into the audio element
  //           const audio = audioRefs.current[index];
  //           if (audio) {
  //             audio.src = statusData.download_url;
  //             audio.play().catch(err => console.error("Play error:", err));
  //             setIsPlaying(true);
  //           }
  //         }
  //       }, 2000); // Check every 2 seconds
  //     }
  //   } catch (error) {
  //     console.error("Music Server Connection Failed:", error);
  //   }
  // };





  // const handleMainPlay = async (index, sourceSongs) => {
  //   // If we clicked a song from a specific list (like Search), update the main songs state
  //   const currentList = sourceSongs || songs;
  //   const selectedSong = currentList[index];

  //   if (!selectedSong) return;

  //   console.log("📡 handleMainPlay triggered for:", selectedSong.title || selectedSong.song);

  //   // 1. Same song? Toggle.
  //   if (index === currentSongIndex && !sourceSongs) {
  //     setIsPlaying((prev) => !prev);
  //     return;
  //   }

  //   // 2. Clear all previous audio tracks
  //   audioRefs.current.forEach((ref) => {
  //     if (ref) {
  //       ref.pause();
  //       ref.src = ""; 
  //     }
  //   });

  //   setCurrentSongIndex(index);
  //   if (sourceSongs) setSongs(sourceSongs);
  //   setIsPlaying(false); // Pause while bot works

  //   const SERVER_URL = "http://localhost:3000";

  //   try {
  //     console.log("🤖 Asking Telegram Bot to fetch ID:", selectedSong.id);
  //     const addRes = await fetch(`${SERVER_URL}/add?id=${selectedSong.id}`);
  //     const addData = await addRes.json();

  //     if (addData.status === "success" || addData.message?.includes("already")) {
  //       const pollInterval = setInterval(async () => {
  //         const statusRes = await fetch(`${SERVER_URL}/status?id=${selectedSong.id}`);
  //         const statusData = await statusRes.json();
  //         console.log("🔄 Bot Status:", statusData.status);

  //         if (statusData.status === "completed") {
  //           clearInterval(pollInterval);
  //           console.log("✅ MP3 Ready! URL:", statusData.download_url);

  //           const audio = audioRefs.current[index];
  //           if (audio) {
  //             audio.src = statusData.download_url;
  //             audio.play();
  //             setIsPlaying(true);
  //           }
  //         }
  //       }, 2000);
  //     }
  //   } catch (err) {
  //     console.error("❌ Failed to reach Saadhna Server:", err);
  //   }
  // };


  const handleMainPlay = async (index, sourceSongs) => {
    const currentList = sourceSongs || songs;
    const selectedSong = currentList[index];
    if (!selectedSong) return;

    // ✅ Clear any previous polling interval FIRST
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Stop previous tracks and clear sources
    audioRefs.current.forEach((ref) => {
      if (ref) {
        ref.pause();
        ref.src = "";
        ref.load();
      }
    });

    setCurrentSongIndex(index);
    if (sourceSongs) setSongs(sourceSongs);
    setPlayingSongs(currentList);
    setPlayingSongIndex(index);
    setIsPlaying(false);
    // inside handleMainPlay, after setPlayingSongIndex(index):
trackPlayedSong(selectedSong);

    const audio = persistentAudioRef.current;
    if (!audio) return;

    // Reset any previous handlers
    audio.oncanplaythrough = null;
    audio.pause();
    audio.src = "";

    // ✅ FAST PATH: If song has a direct download URL from the API, play instantly!
    if (selectedSong.media_url) {
      console.log("⚡ Instant play:", selectedSong.title);
      audio.src = selectedSong.media_url;
      audio.load();
      audio.oncanplaythrough = () => {
        audio.play().catch(e => console.error("Playback failed:", e));
        setIsPlaying(true);
        document.title = `▶️ ${selectedSong.title}`;
      };
      return; // Done! No server needed
    }

    // ✅ SLOW PATH (fallback): Use saadhna-server for songs without direct URL
    const SERVER_URL = "http://localhost:3000";

    try {
      console.log("🤖 No direct URL, asking Bot:", selectedSong.id);
      const addRes = await fetch(`${SERVER_URL}/add?id=${selectedSong.id}`);
      const addData = await addRes.json();
      console.log("📡 Add response:", addData);

      // ✅ Polling with max retries and proper cleanup
      let retryCount = 0;
      const MAX_RETRIES = 30; // 30 × 2s = 60 seconds max wait

      pollIntervalRef.current = setInterval(async () => {
        retryCount++;

        // ✅ Stop polling after max retries
        if (retryCount > MAX_RETRIES) {
          console.warn("⏰ Polling timed out after 60 seconds");
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          return;
        }

        try {
          const statusRes = await fetch(`${SERVER_URL}/status?id=${selectedSong.id}`);
          const statusData = await statusRes.json();

          console.log(`🔄 Poll #${retryCount}:`, statusData.status);

          // ✅ Stop polling on failure states
          if (statusData.status === "Failed" || statusData.status === "Not in queue") {
            console.error("❌ Song compilation failed:", statusData.status);
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            return;
          }

          // ✅ Server returns "Done" with "url" field (not "download_url")
          if (statusData.status === "Done") {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;

            if (statusData.url) {
              // Ensure the URL is absolute
              const fullDownloadUrl = statusData.url.startsWith('http')
                ? statusData.url
                : `${SERVER_URL}${statusData.url}`;

              console.log("✅ Playing from:", fullDownloadUrl);
              audio.src = fullDownloadUrl;
              audio.load();

              audio.oncanplaythrough = () => {
                audio.play().catch(e => console.error("Playback failed:", e));
                setIsPlaying(true);
                document.title = `▶️ ${selectedSong.title}`;
              };
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }, 2000);
    } catch (err) {
      console.error("Connection failed", err);
    }
  };

















  //   const favouriteSongsArray = Object.entries(likedSongs)
  //     .filter(([_, liked]) => liked)
  //     .map(([index]) => songs[Number(index)]);

  return (
    <div className="player-root">



      <div className="dotgrid-fullscreen">
        <DotGrid
          className="fixed inset-0-z-0"
          dotSize={5}
          gap={15}
          baseColor="#271E37"
          activeColor="#5227FF"
          proximity={200}
          shockRadius={300}
          shockStrength={5}
          resistance={500}
          returnDuration={1.5}
        />
      </div>


      {/* <button
        className="hamburger"
        // onClick={() => setSidebarOpen(prev => !prev)}
      >
        ☰
      </button> */}
      <button className="hamburger" onClick={toggleSidebar}>☰</button>

      <SideBar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === "home") setShowSearchResults(false);
        }}
      />



      <div className="player-panel">
        <SearchBar onResults={handleSearchResults} />
        {/* <SearchBar onResults={(results) => {
  setSongs(results);
  setActiveTab("home");
  setShowSearchResults(true);

}} /> */}


        {activeTab === "search" ? (
          <div className="song-row">
            <SongList
              songs={songs}
              likedSongs={likedSongs}
              toggleLike={toggleLike}
              handleMainPlay={handleMainPlay}
              currentSongIndex={currentSongIndex}
              isPlaying={isPlaying}
              audioRefs={audioRefs}
              onAddToQueue={addToQueue}
            />
          </div>
        ) : activeTab === "home" ? (
          <HomePage
            userId={userId}
            songs={songs}
            showSearchResults={showSearchResults}
            setActiveTab={setActiveTab}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
            handleMainPlay={handleMainPlay}
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            audioRefs={audioRefs}
            onAddToQueue={addToQueue}
          />
        ) : activeTab === "playlists" ? (
          <Playlists
            userId={userId}
            handleMainPlay={handleMainPlay}
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            audioRefs={audioRefs}
            onAddToQueue={addToQueue}
          />
        ) : activeTab === "favourites" ? (
          <Favourites
            userId={userId}
            songs={songs}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
            handleMainPlay={handleMainPlay}
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            audioRefs={audioRefs}
            onAddToQueue={addToQueue}
          />
        ) : null}



      </div>

      <div className="user-menu-container">
        <div
          className="user-icon"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <User size={20} />
        </div>
        {showDropdown && (
          <div className="dropdown-menu">
            {auth.currentUser && (
              <div className="dropdown-user-info">
                {auth.currentUser.displayName && (
                  <span className="dropdown-user-name">{auth.currentUser.displayName}</span>
                )}
                {auth.currentUser.email && (
                  <span className="dropdown-user-email">{auth.currentUser.email}</span>
                )}
              </div>
            )}
            <button
              onClick={() => {
                signOut(auth)
                  .then(() => {
                    navigate("/", { replace: true });
                  })
                  .catch((error) => console.error("Logout error:", error));
              }}
            >
              Logout
            </button>
          </div>
        )}

      </div>

      {/* ✅ Persistent audio element — never unmounts, survives tab changes */}
      <audio ref={persistentAudioRef} style={{ display: 'none' }} />

      {playingSongIndex !== null && playingSongs[playingSongIndex] && (
        <Playerbar
          persistentAudioRef={persistentAudioRef}
          audioRefs={audioRefs}
          currentIndex={playingSongIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          setCurrentIndex={setPlayingSongIndex}
          songs={playingSongs}
          song={playingSongs[playingSongIndex]}
          handleMainPlay={(idx, list) => handleMainPlay(idx, list || playingSongs)}
          onNext={handleNextFromPlayer}
          onPrev={handlePrevFromPlayer}
          showLyrics={showLyrics}
          onToggleLyrics={() => setShowLyrics((v) => !v)}
          lyricsText={lyricsText}
          syncedLyrics={syncedLyrics}
          lyricsMode={lyricsMode}
        />
      )}


    </div>
  );
}

export default Player;


