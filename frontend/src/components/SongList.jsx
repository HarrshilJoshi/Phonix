// import React, { useEffect, useState } from "react";
// import { Play } from "lucide-react";
// import { auth } from "../firebase";
// import {
//   getAllPlaylists,
//   addSongToPlaylist,
//   createPlaylist,
// } from "../utils/PlaylistUtils";
// import "./Song-card.css";
// import "./PlayLists.css";

// const SongList = ({
//   songs,
//   likedSongs,
//   toggleLike,
//   handleMainPlay,
//   currentSongIndex,
//   isPlaying,
//   audioRefs,
// }) => {
//   const [showMenuIndex, setShowMenuIndex] = useState(null);
//   const [playlists, setPlaylists] = useState([]);
//   const [newPlaylistName, setNewPlaylistName] = useState("");
//   const [selectedSong, setSelectedSong] = useState(null);

//   // Load playlists on auth state change
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       if (user) {
//         const data = await getAllPlaylists(user.uid);
//         console.log("🎧 All playlists fetched:", data);
//         setPlaylists(data);
//       } else {
//         setPlaylists([]);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const openMenuForSong = (index, song) => {
//     setSelectedSong(song);
//     setShowMenuIndex(index === showMenuIndex ? null : index);
//     setNewPlaylistName("");
//   };

//   const handleAddExisting = async (playlistId) => {
//     const userId = auth.currentUser?.uid;
//     if (!userId || !selectedSong) return;

//     await addSongToPlaylist(userId, playlistId, selectedSong);
//     alert(`✅ Added to playlist "${playlistId}"`);
//     setShowMenuIndex(null);
//   };

//   const handleCreateAndAdd = async () => {
//     const uid = auth.currentUser?.uid;
//     if (!uid || !newPlaylistName.trim() || !selectedSong) return;

//     await createPlaylist(uid, newPlaylistName.trim(), selectedSong);
//     alert(`✅ Created "${newPlaylistName}" and added song`);

//     const updated = await getAllPlaylists(uid);
//     setPlaylists(updated);
//     setNewPlaylistName("");
//     setShowMenuIndex(null);
//   };

//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//         gap: "50px",
//         padding: "40px",
//         width: "100%",
//         boxSizing: "border-box",
//       }}
//     >
//       {songs.map((song, index) => (
//         <div className="song-card" key={song.id || index}>
//           <img src={song.image} alt={song.album} className="song-image" />
//           <p className="song-album">{song.album || "Unknown Album"}</p>
//           <p className="song-singer">{song.singers || "Unknown Singer"}</p>
//           <p className="song-duration">
//             {Math.floor(song.duration / 60)}:{(`0${song.duration % 60}`).slice(-2)}
//           </p>
//           <p className="song-plays">Plays: {song.play_count}</p>

//           <audio
//             ref={(el) => (audioRefs.current[index] = el)}
//             src={song.media_url}
//             style={{ display: "none" }}
//           />

//           <div className="controls-row">
//             <div
//               onClick={() => handleMainPlay(index)}
//               className="play-button"
//               title="Play"
//             >
//               <Play
//                 size={16}
//                 style={{
//                   color:
//                     currentSongIndex === index && isPlaying ? "#5227FF" : "white",
//                 }}
//               />
//             </div>

//             <button
//               onClick={() => toggleLike(song)}
//               className="favorite-button"
//               title="Favorite"
//             >
//               {likedSongs[song.media_url] ? "💜" : "🤍"}
//             </button>

//             <button
//               onClick={() => openMenuForSong(index, song)}
//               className="favorite-button"
//               title="Add to Playlist"
//             >
//               ⋮
//             </button>

//             {showMenuIndex === index && (
//               <div className="modal-overlay">
//                 <div className="modal-content">
//                   <div className="existing-playlists-scroll">
//                     {playlists.length === 0 ? (
//                       <p>No playlists yet.</p>
//                     ) : (
//                       playlists.map((pl) => (
//                         <button
//                           key={pl.name}
//                           onClick={() => handleAddExisting(pl.name)}
//                           className="existing-playlist-btn"
//                         >
//                           🎵 {pl.name}
//                         </button>
//                       ))
//                     )}
//                   </div>

//                   <h3>Create New Playlist</h3>
//                   <input
//                     type="text"
//                     placeholder="New Playlist Name"
//                     value={newPlaylistName}
//                     onChange={(e) => setNewPlaylistName(e.target.value)}
//                   />
//                   <div className="modal-actions">
//                     <button className="create" onClick={handleCreateAndAdd}>
//                       ➕ Create & Add
//                     </button>
//                     <button
//                       className="close"
//                       onClick={() => setShowMenuIndex(null)}
//                     >
//                       ❌ Close
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <a
//               href={song.media_url}
//               download
//               className="download-button"
//               title="Download"
//             >
//               <svg
//                 className="download-icon"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M12 16l4-4h-3V4h-2v8H8l4 4zM20 18v2H4v-2h16z" />
//               </svg>
//             </a>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SongList;














import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { auth } from "../firebase";
import {
  getAllPlaylists,
  addSongToPlaylist,
  createPlaylist,
} from "../utils/PlaylistUtils";
import "./Song-card.css";
import "./PlayLists.css";

const SongList = ({
  songs,
  likedSongs,
  toggleLike,
  handleMainPlay,
  currentSongIndex,
  isPlaying,
  audioRefs,
  onAddToQueue,
}) => {
  const [showMenuIndex, setShowMenuIndex] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const SONGS_PER_PAGE = 12;

  // ✅ LOAD PLAYLISTS WITH CLEANUP (UNSUBSCRIBE)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await getAllPlaylists(user.uid);
          setPlaylists(data);
        } catch (err) {
          console.error("Failed to fetch playlists:", err);
        }
      } else {
        setPlaylists([]);
      }
    });

    // ✅ This is your unsubscribe - it runs when the component unmounts
    return () => unsubscribe();
  }, []);

  const openMenuForSong = (index, song) => {
    setSelectedSong(song);
    setShowMenuIndex(index); // Just set the index to show the modal
    setNewPlaylistName("");
  };

  const handleAddExisting = async (playlistName) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !selectedSong) return;

    await addSongToPlaylist(userId, playlistName, selectedSong);
    alert(`✅ Added to playlist "${playlistName}"`);
    setShowMenuIndex(null);
  };

  const handleCreateAndAdd = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !newPlaylistName.trim() || !selectedSong) return;

    await createPlaylist(uid, newPlaylistName.trim(), selectedSong);

    // Refresh playlists list
    const updated = await getAllPlaylists(uid);
    setPlaylists(updated);

    setNewPlaylistName("");
    setShowMenuIndex(null);
    alert(`✅ Created "${newPlaylistName}" and added song`);
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(songs.length / SONGS_PER_PAGE);
  const startIdx = (currentPage - 1) * SONGS_PER_PAGE;
  const visibleSongs = songs.slice(startIdx, startIdx + SONGS_PER_PAGE);

  // Reset page when songs change
  useEffect(() => {
    setCurrentPage(1);
  }, [songs]);

  return (
    <div className="song-list-wrapper">
      <div
        className="songs-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "24px",
          padding: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {visibleSongs.map((song, pageIndex) => {
          const actualIndex = startIdx + pageIndex;
          return (
            <div className="song-card" key={song.id || actualIndex}>
              <img src={song.image} alt={song.album} className="song-image" />
              <p className="song-title">{song.title || song.name || "Unknown Title"}</p>
              <p className="song-album">{song.album || "Unknown Album"}</p>
              <p className="song-singer">{song.singers || "Unknown Singer"}</p>
              <p className="song-duration">
                {Math.floor(song.duration / 60)}:
                {(`0${song.duration % 60}`).slice(-2)}
              </p>

              <audio
                ref={(el) => (audioRefs.current[actualIndex] = el)}
                src={song.media_url || undefined}
                preload="none"
                style={{ display: "none" }}
              />

              <div className="controls-row">
                <div onClick={() => handleMainPlay(actualIndex)} className="play-button">
                  <Play
                    size={16}
                    style={{
                      color: currentSongIndex === actualIndex && isPlaying ? "#5227FF" : "white",
                    }}
                  />
                </div>

                <button onClick={() => toggleLike(song)} className="favorite-button">
                  {likedSongs[song.id || song.media_url] ? "💜" : "🤍"}
                </button>

                <button onClick={() => openMenuForSong(actualIndex, song)} className="menu-button">
                  ⋮
                </button>

                {song.media_url && (
                  <a href={song.media_url} download className="download-button">
                    <svg className="download-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 16l4-4h-3V4h-2v8H8l4 4zM20 18v2H4v-2h16z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ◀ Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next ▶
          </button>
        </div>
      )}

      {showMenuIndex !== null && selectedSong && (
        <div className="modal-overlay" onClick={() => setShowMenuIndex(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add to Playlist</h3>
            <p className="selected-song-name">Song: {selectedSong.title || selectedSong.album}</p>

            {onAddToQueue && (
              <button
                type="button"
                className="add-to-queue-btn"
                onClick={() => {
                  onAddToQueue(selectedSong);
                  setShowMenuIndex(null);
                }}
              >
                ➕ Add to Queue
              </button>
            )}

            <div className="existing-playlists-scroll">
              {playlists.length === 0 ? (
                <p className="no-playlists">No playlists yet.</p>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl.name}
                    onClick={() => handleAddExisting(pl.name)}
                    className="existing-playlist-btn"
                  >
                    🎵 {pl.name}
                  </button>
                ))
              )}
            </div>

            <div className="create-section">
              <h4>Create New</h4>
              <input
                type="text"
                placeholder="Playlist Name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <div className="modal-actions">
                <button className="create-btn" onClick={handleCreateAndAdd}>
                  ➕ Create & Add
                </button>
                <button className="close-btn" onClick={() => setShowMenuIndex(null)}>
                  ❌ Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongList;


