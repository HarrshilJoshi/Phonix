import React, { useEffect, useState, useRef } from 'react';
import './playerbar.css';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaSyncAlt, FaRandom, FaListUl } from 'react-icons/fa';

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
  lyricsMode,
  isShuffle,
  setIsShuffle,
  isRepeat,
  setIsRepeat,
  queue,
  setQueue
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQueue, setShowQueue] = useState(false);
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
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("Replay failed:", e));
        setProgress(0);
        setCurrentTime(0);
      } else {
        if (onNext) onNext();
        else handleNext();
      }
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
  }, [audio, currentIndex, isRepeat, onNext]);

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
    let nextIndex;
    if (isShuffle && songs.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = (currentIndex + 1) % Math.max(songs.length, 1);
    }
    handleMainPlay(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + songs.length) % Math.max(songs.length, 1);
    handleMainPlay(prevIndex);
  };

  if (!song) return null;

  return (
    <div className="playerbar-wrapper">
      {/* Lyrics box */}
      {showLyrics && (
        <div className="lyrics-box-above-player">
          <div className="lyrics-box-inner">
            <h4 className="lyrics-box-title">Lyrics</h4>
            <div className="lyrics-box-content">
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
              ) : lyricsText !== null ? (
                <pre className="lyrics-text">
                  {lyricsText || "No lyrics available for this song."}
                </pre>
              ) : (
                <span className="lyrics-loading">Loading…</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Queue box */}
      {showQueue && (
        <div className="queue-box-above-player">
          <div className="queue-box-inner">
            <div className="queue-box-header">
              <h4 className="queue-box-title">Play Queue</h4>
              {queue && queue.length > 0 && (
                <button className="clear-queue-btn" onClick={() => setQueue([])}>Clear Queue</button>
              )}
            </div>
            <div className="queue-box-content">
              {/* Currently Playing Section */}
              <div className="queue-section">
                <span className="queue-section-title">Now Playing</span>
                <div className="queue-item active">
                  <img src={song.image} alt="" className="qi-art" />
                  <div className="qi-info">
                    <span className="qi-title">{song.title || song.name || 'Unknown Title'}</span>
                    <span className="qi-artist">{song.singers || 'Unknown Artist'}</span>
                  </div>
                </div>
              </div>

              {/* Next In Queue (Manual Queue) */}
              {queue && queue.length > 0 && (
                <div className="queue-section">
                  <span className="queue-section-title">Next In Queue</span>
                  {queue.map((qSong, idx) => (
                    <div key={`q-${idx}`} className="queue-item">
                      <img src={qSong.image} alt="" className="qi-art" />
                      <div className="qi-info">
                        <span className="qi-title">{qSong.title || qSong.name || 'Unknown Title'}</span>
                        <span className="qi-artist">{qSong.singers || 'Unknown Artist'}</span>
                      </div>
                      <button 
                        className="qi-remove-btn" 
                        onClick={() => setQueue(prev => prev.filter((_, i) => i !== idx))}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Up from current playlist */}
              {songs.slice(currentIndex + 1).length > 0 && (
                <div className="queue-section">
                  <span className="queue-section-title">Next Up</span>
                  {songs.slice(currentIndex + 1).map((upSong, idx) => (
                    <div key={`up-${idx}`} className="queue-item" style={{ cursor: 'pointer' }} onClick={() => handleMainPlay(currentIndex + 1 + idx)}>
                      <img src={upSong.image} alt="" className="qi-art" />
                      <div className="qi-info">
                        <span className="qi-title">{upSong.title || upSong.name || 'Unknown Title'}</span>
                        <span className="qi-artist">{upSong.singers || 'Unknown Artist'}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
              <button 
                className={`pb-btn ${isShuffle ? 'active' : ''}`} 
                onClick={() => setIsShuffle(!isShuffle)}
                title={isShuffle ? "Disable Shuffle" : "Enable Shuffle"}
              >
                <FaRandom />
              </button>
              <button className="pb-btn" onClick={onPrev || handlePrev}><FaStepBackward /></button>
              <button className="pb-btn play-main" onClick={handleTogglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button className="pb-btn" onClick={onNext || handleNext}><FaStepForward /></button>
              <button 
                className={`pb-btn ${isRepeat ? 'active' : ''}`} 
                onClick={() => setIsRepeat(!isRepeat)}
                title={isRepeat ? "Disable Repeat" : "Enable Repeat"}
              >
                <FaSyncAlt />
              </button>
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
          </div>

          {/* Sidebar / Drawer buttons */}
          <div className="playerbar-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

            <div className="pb-queue-toggle-wrap">
              <button
                type="button"
                className={`pb-btn ${showQueue ? 'active' : ''}`}
                onClick={() => setShowQueue(!showQueue)}
                title="Toggle Queue"
              >
                <FaListUl />
              </button>
            </div>
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
