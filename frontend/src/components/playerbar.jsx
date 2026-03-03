import React, { useEffect, useState, useRef } from 'react';
import './playerbar.css';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';

const Playerbar = ({
  song,
  persistentAudioRef,
  audioRefs,
  currentIndex,
  isPlaying,
  setIsPlaying,
  setCurrentIndex,
  songs,
  handleMainPlay,
  onNext,
  onPrev,
  showLyrics,
  onToggleLyrics,
  lyricsText,
  syncedLyrics,
  lyricsMode
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressContainerRef = useRef(null);

  const audio = persistentAudioRef?.current;
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);

// Sync highlight on timeupdate
useEffect(() => {
  if (lyricsMode !== "synced" || !syncedLyrics?.length || !audio) return;

  const handleTimeUpdate = () => {
    const current = audio.currentTime;
    let activeIndex = -1;
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (syncedLyrics[i].time <= current) activeIndex = i;
      else break;
    }
    setActiveLyricIndex(activeIndex);
  };

  audio.addEventListener("timeupdate", handleTimeUpdate);
  return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
}, [lyricsMode, syncedLyrics, audio]);

// Auto scroll active line into center
useEffect(() => {
  if (activeLyricIndex < 0) return;
  document.querySelector(".lyric-line.active")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}, [activeLyricIndex]);
  // Progress and auto-next logic
  useEffect(() => {
    if (!audio) return;

    const updateProgress = () => {
      if (isNaN(audio.duration)) return;
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    const handleSongEnd = () => {
      if (onNext) onNext();
      else handleNext();
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleSongEnd);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [audio, currentIndex]);

  const handleTogglePlay = () => {
    if (!audio || !audio.src || audio.src === window.location.href) {
      handleMainPlay(currentIndex);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const seekToPosition = (clientX) => {
    if (!audio || isNaN(audio.duration) || !progressContainerRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = clickPos * audio.duration;
  };

  const handleSeek = (e) => {
    seekToPosition(e.clientX);
  };

  const handleTouchStart = (e) => {
    seekToPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    seekToPosition(e.touches[0].clientX);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % Math.max(songs.length, 1);
    handleMainPlay(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + songs.length) % Math.max(songs.length, 1);
    handleMainPlay(prevIndex);
  };

  if (!song) return null;

  return (
    <div className="playerbar-wrapper">
      {/* Lyrics box directly above the bar, inside same fixed container */}
    {showLyrics && (
  <div className="lyrics-box-above-player">
    <div className="lyrics-box-inner">
      <h4 className="lyrics-box-title">Lyrics</h4>
      <div className="lyrics-box-content">

        {/* ✅ Synced lyrics — animated highlight */}
        {lyricsMode === "synced" && syncedLyrics?.length > 0 ? (
          syncedLyrics.map((line, i) => (
            <p
              key={i}
              className={`lyric-line ${
                i === activeLyricIndex ? "active" : i < activeLyricIndex ? "past" : ""
              }`}
            >
              {line.text}
            </p>
          ))

        /* ✅ Plain lyrics — your existing behavior */
        ) : lyricsText !== null ? (
          <pre className="lyrics-text">
            {lyricsText || "No lyrics available for this song."}
          </pre>

        /* ✅ Loading state */
        ) : (
          <span className="lyrics-loading">Loading…</span>
        )}

      </div>
    </div>
  </div>
)}

      <div className="playerbar-container">
      <div className="playerbar-inner">
        {/* Song Details */}
        <div className="song-info-bar">
          <img
            className="pb-album-art"
            src={song.image}
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/60')}
            alt={song.album}
          />
          <div className="pb-text-info">
            <div className="pb-title">{song.title || song.name || 'Unknown Title'}</div>
            <div className="pb-artist">{song.singers || 'Unknown Artist'}</div>
          </div>
        </div>

        {/* Controls and Progress */}
        <div className="player-controls-container">
          <div className="player-controls">
            <button className="pb-btn" onClick={onPrev || handlePrev}><FaStepBackward /></button>
            <button className="pb-btn play-main" onClick={handleTogglePlay}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button className="pb-btn" onClick={onNext || handleNext}><FaStepForward /></button>
          </div>

          <div className="progress-wrapper">
            <span className="time-text">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressContainerRef}
              className="progress-container"
              onClick={handleSeek}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={(e) => e.preventDefault()}
            >
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="time-text">
              {duration && !isNaN(duration) ? formatTime(duration) : "0:00"}
            </span>
          </div>

          {onToggleLyrics && (
            <div className="pb-lyrics-toggle-wrap">
              <span className="pb-lyrics-label">Lyrics</span>
              <button
                type="button"
                className={`pb-lyrics-toggle ${showLyrics ? 'on' : ''}`}
                onClick={onToggleLyrics}
                aria-label={showLyrics ? 'Hide lyrics' : 'Show lyrics'}
              >
                <span className="pb-lyrics-thumb" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

// Helper to format time (0:00)
const formatTime = (time) => {
  if (!time || isNaN(time)) return "0:00";
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};

export default Playerbar;
