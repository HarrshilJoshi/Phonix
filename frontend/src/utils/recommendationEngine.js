const JIOSAAVN_API = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs";

// ─── MAIN ENTRY POINT ────────────────────────────────────────────────────────
export const getRecommendations = async (likedSongs = [], playHistory = []) => {

  // ✅ New account — no data at all → Bollywood popular
  if (likedSongs.length === 0 && playHistory.length === 0) {
    console.log("🆕 New account → fetching Bollywood popular");
    return await fetchBollywoodPopular();
  }

  // ─── STEP 1: Artist Score Matrix ─────────────────────────────────────────
  const artistScores = {};

  // Liked songs = strongest signal (3 points each)
  likedSongs.forEach((song) => {
    const primary = song.primaryArtists || song.singers || "";
    primary.split(",").forEach((a) => {
      const name = a.trim();
      if (name) artistScores[name] = (artistScores[name] || 0) + 3;
    });

    // Featured artists = weaker signal (1 point)
    const featured = song.featuredArtists || "";
    featured.split(",").forEach((a) => {
      const name = a.trim();
      if (name) artistScores[name] = (artistScores[name] || 0) + 1;
    });
  });

  // Play history = medium signal (2 points) with recency decay
  const now = Date.now();
  playHistory.forEach((song) => {
    const daysSince = (now - (song.playedAt || now)) / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.exp(-daysSince * 0.05); // fades over ~20 days
    const primary = song.primaryArtists || song.singers || "";
    primary.split(",").forEach((a) => {
      const name = a.trim();
      if (name) artistScores[name] = (artistScores[name] || 0) + (2 * recencyWeight);
    });
  });

  // ─── STEP 2: Top 3 Artists ───────────────────────────────────────────────
  const topArtists = Object.entries(artistScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  console.log("🎤 Top artists for recs:", topArtists);

  // ─── STEP 3: Album Affinity — albums with 2+ liked songs get bonus ───────
  const albumCount = {};
  likedSongs.forEach((song) => {
    const albumName = song.album?.name || song.album;
    if (albumName) albumCount[albumName] = (albumCount[albumName] || 0) + 1;
  });
  const hotAlbums = new Set(
    Object.entries(albumCount)
      .filter(([_, count]) => count >= 2)
      .map(([name]) => name)
  );

  // ─── STEP 4: Blocklist — never recommend already liked/played ────────────
  const blockedIds = new Set([
    ...likedSongs.map((s) => s.id),
    ...playHistory.map((s) => s.id),
  ].filter(Boolean));

  const blockedUrls = new Set(
    likedSongs.map((s) => s.media_url).filter(Boolean)
  );

  const isBlocked = (track) => {
    if (track.id && blockedIds.has(track.id)) return true;
    const url = track.downloadUrl?.[4]?.link || track.downloadUrl?.[3]?.link;
    if (url && blockedUrls.has(url)) return true;
    return false;
  };

  // ─── STEP 5: Fetch from JioSaavn API ─────────────────────────────────────
  let rawRecs = [];
  for (const artist of topArtists) {
    try {
      const res = await fetch(
        `${JIOSAAVN_API}?query=${encodeURIComponent(artist)}&limit=15`
      );
      const data = await res.json();
      const results = data?.data?.results ?? data?.results ?? [];
      if (Array.isArray(results)) rawRecs = [...rawRecs, ...results];
    } catch (err) {
      console.error(`❌ Fetch failed for "${artist}":`, err);
    }
  }

  // ─── STEP 6: Deduplicate + filter blocked ────────────────────────────────
  const uniqueRecs = new Map();
  rawRecs.forEach((track) => {
    if (isBlocked(track) || uniqueRecs.has(track.id)) return;
    uniqueRecs.set(track.id, track);
  });

  // ─── STEP 7: ML Scoring Formula ──────────────────────────────────────────
  const scored = Array.from(uniqueRecs.values()).map((track) => {
    let score = 0;

    // Popularity (log scale — prevents 1B plays from dominating)
    score += Math.log10(parseInt(track.playCount) || 1) * 2;

    // Artist match bonus (uses your weighted scores from liked + played)
    const trackArtists = (track.primaryArtists || "").split(",").map((a) => a.trim());
    trackArtists.forEach((a) => {
      if (artistScores[a]) score += artistScores[a] * 0.5;
    });

    // Hot album bonus (liked 2+ songs from same album)
    const trackAlbum = track.album?.name || track.album;
    if (trackAlbum && hotAlbums.has(trackAlbum)) score += 5;

    return { ...track, _score: score };
  });

  // ─── STEP 8: Sort by score ────────────────────────────────────────────────
  return scored.sort((a, b) => b._score - a._score);
};

// ─── BOLLYWOOD POPULAR (new accounts fallback) ───────────────────────────────
const fetchBollywoodPopular = async () => {
  const queries = ["bollywood hits 2025", "trending hindi songs", "arijit singh hits"];
  let results = [];

  for (const q of queries) {
    try {
      const res = await fetch(
        `${JIOSAAVN_API}?query=${encodeURIComponent(q)}&limit=10`
      );
      const data = await res.json();
      const songs = data?.data?.results ?? data?.results ?? [];
      results = [...results, ...songs];
    } catch (err) {
      console.error("❌ Bollywood fallback error:", err);
    }
  }

  // Deduplicate + sort by playCount
  const unique = new Map();
  results.forEach((s) => { if (s.id && !unique.has(s.id)) unique.set(s.id, s); });

  return Array.from(unique.values())
    .sort((a, b) => (parseInt(b.playCount) || 0) - (parseInt(a.playCount) || 0));
};