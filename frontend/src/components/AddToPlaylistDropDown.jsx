import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { getAllPlaylists, addSongToPlaylist } from "../utils/PlaylistUtils";
import "./AddToPlaylistDropdown.css";

export default function AddToPlaylistDropdown({ song }) {
  const [playlists, setPlaylists] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch playlists when dropdown opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      const user = auth.currentUser;
      if (!user) return;
      const data = await getAllPlaylists(user.uid);
      setPlaylists(data);
    })();
  }, [open]);

  const handleAdd = async (playlistName) => {
    const user = auth.currentUser;
    if (!user) return;
    await addSongToPlaylist(user.uid, playlistName, song);
    setOpen(false);
    // you could trigger a toast here
  };

  return (
    <div className="add-dropdown" ref={containerRef}>
      <button
        className="add-dropdown-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        ➕ Add to…
      </button>

      {open && (
        <div className="add-dropdown-menu">
          {playlists.length === 0 ? (
            <p className="no-playlists">No playlists</p>
          ) : (
            playlists.map((pl) => (
              <div
                key={pl.name}
                className="add-dropdown-item"
                onClick={() => handleAdd(pl.name)}
              >
                🎵 {pl.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
