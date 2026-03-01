import React, { useEffect, useState } from "react";
import { getLikedSongs } from "../utils/likedSong.js";
import SongList from "./SongList.jsx";
import "./favourites.css";

const Favourites = ({
  userId,
  songs,
  likedSongs,
  handleMainPlay,
  currentSongIndex,
  isPlaying,
  audioRefs,
  toggleLike,
  onAddToQueue,
}) => {
  const [fetchedLikedSongs, setFetchedLikedSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const songs = await getLikedSongs(userId);
      setFetchedLikedSongs(songs);
    };
    fetchSongs();
  }, [likedSongs, userId]); // Re-fetch when likedSongs or userId changes

  // Build a liked map from fetched songs so hearts show as filled
  const likedMap = {};
  fetchedLikedSongs.forEach((song) => {
    const key = song.id || song.media_url;
    if (key) {
      likedMap[key] = true;
    }
  });

  return (
    <div className="favourites-container">
      <h2 className="favourites-title">Your Liked Songs</h2>
      <SongList
        songs={fetchedLikedSongs}
        likedSongs={likedMap}
        toggleLike={toggleLike}
        handleMainPlay={(index) => handleMainPlay(index, fetchedLikedSongs)}
        currentSongIndex={currentSongIndex}
        isPlaying={isPlaying}
        audioRefs={audioRefs}
        onAddToQueue={onAddToQueue}
      />
    </div>
  );
};

export default Favourites;
