// // src/components/SearchBar.jsx
// import React, { useState } from 'react';
// import './seachbar.css';

// const SearchBar = ({ onResults }) => {
//   const [query, setQuery] = useState('');

// //   const handleSearch = async (e) => {
// //     e.preventDefault();
// //     if (!query.trim()) return;

// //     try {
// //       // ✅ We keep using this API for searching
// //       const res = await fetch(
// //         `https://saavnapi-nine.vercel.app/result/?query=${encodeURIComponent(query)}`
// //       );
// //       const data = await res.json();

// //       let flatSongs = [];

// //       if (Array.isArray(data)) {
// //         // If it's a direct array of songs
// //         if (data.length > 0 && data[0].song) {
// //           flatSongs = data;
// //         } 
// //         // If it's grouped (Top Results, Songs, Albums, etc.)
// //         else if (data.length > 0 && Array.isArray(data[0].songs)) {
// //           flatSongs = data.flatMap(group => group.songs);
// //         }
// //       }

// //       // 🛠️ CRITICAL STEP: Map the data so the ID is clean
// //       // The Saadhna server needs the short ID (e.g., '4ZJPDxcU')
// //       // const formattedSongs = flatSongs.map(s => ({
// //       //   ...s,
// //       //   id: s.id || s.songId, // Ensure we have a standard ID property
// //       //   title: s.song || s.title,
// //       //   // We DELETE the media_url to force the player to use our Telegram server
// //       //   media_url: null 
// //       // }));

// //       // onResults(formattedSongs);
// //       const formattedSongs = flatSongs.map(s => ({
// //   ...s,
// //   id: s.id || s.songId || s.perma_url?.split('/').pop(), // Fallback to extract ID from URL if needed
// //   title: s.song || s.title,
// // }));
// // onResults(formattedSongs);
// //     } catch (err) {
// //       console.error('Search failed:', err);
// //       onResults([]);
// //     }
// //   };



// const handleSearch = async (e) => {
//   e.preventDefault();
//   if (!query.trim()) return;

//   try {
//     // ✅ Using the endpoint from your reference for 40 results
//     const searchUrl = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";
//     const res = await fetch(`${searchUrl}${encodeURIComponent(query)}&limit=40&page=1`);

//     const json = await res.json();

//     // Check if results exist in the 'data.results' path as per your reference
//     const songsArray = json.data?.results || [];

//     if (songsArray.length > 0) {
//       const formattedSongs = songsArray.map((track) => {
//         // ✅ Format duration to MM:SS as seen in your reference
//         var measuredTime = new Date(null);
//         measuredTime.setSeconds(track.duration);
//         var play_time = measuredTime.toISOString().substr(14, 5);

//         return {
//           ...track,
//           id: track.id,
//           title: track.name,
//           singers: track.primaryArtists || "Unknown Artist",
//           album: track.album?.name || "Single",
//           // ✅ Get high-quality image (index 2 is 500x500 in this API)
//           image: track.image[2]?.link || track.image[1]?.link,
//           durationText: play_time,
//           year: track.year,
//           // ✅ Set media_url to null so handleMainPlay uses your Telegram Bot
//           media_url: null 
//         };
//       });

//       onResults(formattedSongs);
//     } else {
//       onResults([]);
//     }
//   } catch (err) {
//     console.error('Search failed:', err);
//     onResults([]);
//   }
// };









//   return (
//     <form onSubmit={handleSearch} className="search-form">
//       <input
//         type="text"
//         placeholder="Search for music..."
//         className="search-input"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//       />
//       <button type="submit" className="search-button">Search</button>
//     </form>
//   );
// };

// export default SearchBar;











import React, { useState } from 'react';
import './seachbar.css';

const SearchBar = ({ onResults }) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const handleSearch = async (e, isNextPage = false) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // Use the exact API from your reference code
    const searchUrl = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";
    const currentPage = isNextPage ? page + 1 : 1;

    try {
      const fullUrl = `${searchUrl}${encodeURIComponent(query)}&limit=40&page=${currentPage}`;
      const res = await fetch(fullUrl);
      const json = await res.json();

      // Access the results using the data.results path
      const songsArray = json.data?.results || [];

      if (songsArray.length > 0) {
        const formattedSongs = songsArray.map((track) => ({
          ...track,
          id: track.id,
          title: track.name, // The API uses 'name' for the song title
          singers: track.primaryArtists,
          album: track.album?.name || "Single",
          image: track.image[2]?.link || track.image[1]?.link, // Use high quality
          year: track.year,
          // ✅ Use the highest quality direct download URL for INSTANT playback
          // downloadUrl[4] = 320kbps, [3] = 160kbps, [2] = 96kbps (fallbacks)
          media_url: track.downloadUrl?.[4]?.link
            || track.downloadUrl?.[3]?.link
            || track.downloadUrl?.[2]?.link
            || null
        }));

        onResults(formattedSongs);
        if (isNextPage) setPage(currentPage);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={(e) => handleSearch(e)} className="search-form">
        <input
          type="text"
          placeholder="Search for music..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      {/* "Load More" button like your reference code */}
      <button onClick={() => handleSearch(null, true)} className="load-more">
        Load More
      </button>
    </div>
  );
};

export default SearchBar;