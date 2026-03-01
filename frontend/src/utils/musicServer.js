


const SERVER_URL = "http://localhost:3000"; // Update with your server port

export const prepareAndPlaySong = async (trackId) => {
  try {
    // 1. Tell the server to fetch and compile the track
    const addRes = await fetch(`${SERVER_URL}/add?id=${trackId}`);
    const addData = await addRes.json();

    if (addData.status === "success" || addData.message === "Already added") {
      // 2. Poll for status until it's ready
      return await pollSongStatus(trackId);
    }
  } catch (error) {
    console.error("Music Server Error:", error);
  }
};

const pollSongStatus = (trackId) => {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const MAX_RETRIES = 30; // 60 seconds max

    const interval = setInterval(async () => {
      retryCount++;

      if (retryCount > MAX_RETRIES) {
        clearInterval(interval);
        reject(new Error("Polling timed out after 60 seconds"));
        return;
      }

      try {
        const res = await fetch(`${SERVER_URL}/status?id=${trackId}`);
        const data = await res.json();

        // ✅ Server returns "Done" with "url" field
        if (data.status === "Done") {
          clearInterval(interval);
          const fullUrl = data.url?.startsWith('http')
            ? data.url
            : `${SERVER_URL}${data.url}`;
          resolve(fullUrl);
        }

        // ✅ Stop on failure
        if (data.status === "Failed" || data.status === "Not in queue") {
          clearInterval(interval);
          reject(new Error(`Song processing failed: ${data.status}`));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 2000);
  });
};