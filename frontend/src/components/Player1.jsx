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
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { likeSong } from "../utils/likedSong.js";
import Favourites from "./favourites.jsx";
import { addFieldToPlaylist } from "../utils/addFieldToPlaylist.js";
import Playlists from "./PlayLists.jsx";


function Player() {
  const [songs, setSongs] = useState([]);
  const [visibleLyrics, setVisibleLyrics] = useState({});
  const [likedSongs, setLikedSongs] = useState({});
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRefs = useRef([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [showFavourites, setShowFavourites] = useState(false);
  const [showPlayList, setshowPlayList] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);


  useEffect(() => {
    if (currentSongIndex !== null && audioRefs.current[currentSongIndex]) {
      const audio = audioRefs.current[currentSongIndex];
      if (isPlaying) {
        audio.play().catch((err) => console.error("Play failed:", err));
      } else {
        audio.pause();
      }
    }
  }, [currentSongIndex, isPlaying]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // ✅ Liked Songs logic
          const liked = data.likedSongs || [];
          const newLikedMap = {};
          songs.forEach((song, index) => {
            if (liked.some((s) => s.media_url === song.media_url)) {
              newLikedMap[index] = true;
            }
          });
          setLikedSongs(newLikedMap);

          // ✅ Playlists logic
          const userPlaylists = data.playlists || [];
          setUserPlaylists(userPlaylists); // Assume you have useState for this

        } else {
          setLikedSongs({});
          setUserPlaylists([]);
        }
      } else {
        setLikedSongs({});
        setUserPlaylists([]);
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, [songs]); // Optional dependency if songs may change

  const toggleLyrics = (index) => {
    setVisibleLyrics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleLike = (index) => {
    const song = songs[index];
    setLikedSongs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    likeSong(song);
  };


const handleHomeClick = () => {
  // setShowSearch(false);
  setshowPlayList(false);
  setShowFavourites(false);
  setSongs([]);

};
  // const toggle3dot = (index) => {
  //   const song = songs[index];
  //   setshowPlayList((prev) => ({
  //     ...prev,
  //     [index]: !prev[index],
  //   }));
  //   likeSong(song);
  // };



  const handleMainPlay = (index, sourceSongs = songs) => {
    if (index === currentSongIndex) {
      setIsPlaying((prev) => !prev);
    } else {
      audioRefs.current.forEach((ref) => {
        if (ref) {
          ref.pause();
          ref.currentTime = 0;
        }
      });
      setCurrentSongIndex(index);
      setSongs(sourceSongs);
      setIsPlaying(true);
    }
  };

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



      {/* <SideBar/> */}
      <SideBar showFavourites={showFavourites} setShowFavourites={setShowFavourites} showPlayList={showPlayList} setShowPlayList={setshowPlayList}  handleHomeClick={handleHomeClick}/>
      {/* <button onClick={handleAddField}>Add Description</button> */}
      <div className="player-panel">
        <SearchBar onResults={setSongs} />
       <div className="song-row">
  {showFavourites ? (
    <Favourites
      songs={songs}
      likedSongs={likedSongs}
      handleMainPlay={handleMainPlay}
      currentSongIndex={currentSongIndex}
      isPlaying={isPlaying}
      audioRefs={audioRefs}
    />
  ) : showPlayList ? (
    <Playlists
      handleMainPlay={handleMainPlay}
      currentSongIndex={currentSongIndex}
      isPlaying={isPlaying}
      audioRefs={audioRefs}
    />
  ) : (
    <SongList
      songs={songs}
      likedSongs={likedSongs}
      toggleLike={toggleLike}
      handleMainPlay={handleMainPlay}
      currentSongIndex={currentSongIndex}
      isPlaying={isPlaying}
      audioRefs={audioRefs}
    />
  )}
</div>

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
            <button
              onClick={() => {
                signOut(auth)
                  .then(() => {
                    console.log("Logged out");
                    navigate("/");
                  })
                  .catch((error) => console.error("Logout error:", error));
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>


      {currentSongIndex !== null && songs[currentSongIndex] && (
        <Playerbar
          className="searchbar"
          song={songs[currentSongIndex]}
          audioRef={audioRefs.current[currentSongIndex]}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          currentIndex={currentSongIndex}
          setCurrentIndex={setCurrentSongIndex}
          songs={songs}
          audioRefs={audioRefs}
        />
      )}
    </div>
  );
}

export default Player;

