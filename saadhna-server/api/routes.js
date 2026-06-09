var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var https = require('https');
const CryptoJS = require('crypto-js');

var queue = require('../queue.js');
// const app = require('../index.js');
const rateLimit = require('express-rate-limit');
var telegram_mod = require('../modules/telegram.js');

function decryptUrl(encryptedText) {
  if (!encryptedText) return "";
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      encryptedText,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("DES Decryption failed:", err);
    return "";
  }
}

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 30, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// GET home page.
// router.get('/', function(req, res, next) {
//     // return helloworld
//     res.send('Hello World');
// });

router.get('/search', async function(req, res, next) {
    var query = req.query.query;
    if (!query) {
        return res.json({ data: { results: [] } });
    }
    try {
        const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&_format=json&_marker=0&ctx=web6dot0`;
        const fetchRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const json = await fetchRes.json();
        const results = json.results || [];
        
        const formattedResults = results.map(track => {
            const img = track.image || "";
            const image = [
                { quality: "50x50", link: img.replace("150x150", "50x50") },
                { quality: "150x150", link: img },
                { quality: "500x500", link: img.replace("150x150", "500x500") }
            ];

            let media_url = null;
            let downloadUrl = [];
            if (track.encrypted_media_url) {
                const decrypted = decryptUrl(track.encrypted_media_url);
                if (decrypted) {
                    media_url = decrypted.replace(/_(96|48|12|160|320)\.(mp4|mp3)/, "_320.$2");
                    downloadUrl = [
                        { quality: "12kbps", link: decrypted.replace(/_(96|48|12|160|320)\.(mp4|mp3)/, "_12.$2") },
                        { quality: "48kbps", link: decrypted.replace(/_(96|48|12|160|320)\.(mp4|mp3)/, "_48.$2") },
                        { quality: "96kbps", link: decrypted },
                        { quality: "160kbps", link: decrypted.replace(/_(96|48|12|160|320)\.(mp4|mp3)/, "_160.$2") },
                        { quality: "320kbps", link: media_url }
                    ];
                }
            }

            return {
                id: track.id,
                name: track.song,
                album: { name: track.album },
                year: track.year,
                primaryArtists: track.primary_artists || track.music || "Unknown Artist",
                singers: track.singers || track.primary_artists || "Unknown Artist",
                image: image,
                downloadUrl: downloadUrl,
                media_url: media_url,
                duration: track.duration
            };
        });

        res.json({ data: { results: formattedResults } });
    } catch (err) {
        console.error("Search API Error:", err);
        res.json({ data: { results: [] } });
    }
});

router.get('/lyrics', async function(req, res, next) {
    var id = req.query.id;
    if (!id) {
        return res.json({ lyrics: "No id provided" });
    }
    try {
        const url = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&ctx=web6dot0&api_version=4&_format=json&_marker=0&lyrics_id=${encodeURIComponent(id)}`;
        const fetchRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const json = await fetchRes.json();
        if (json.lyrics) {
            res.json({ lyrics: json.lyrics });
        } else {
            res.json({ lyrics: "Lyrics not available." });
        }
    } catch (err) {
        console.error("Lyrics API Error:", err);
        res.json({ lyrics: "Lyrics not available." });
    }
});

router.get('/add', limiter, function(req, res, next) {
    // get id
    var id = req.query.id;
    if(!id){
        res.send('No id provided');
        return 0;
    }
    console.log('id: ' + id);
    // add id to queue
    if(queue.add(id)) {
        res.json({status: 'success'});
    }
});
router.get('/status', function(req, res, next) {
    // get id
    var id = req.query.id;
    if(!id){
        // send json message
        res.json({status: 'No id provided'});
        return 0;
    }
    console.log('status: ' + id);
    // find id in queue lists
    if(id in global.qlist){
        // send json message
        res.json({status: 'Queued'});
    }
    else if(id in global.greenlist){
        // send json message
        res.json({status: 'Fetched'});
    }
    else if(id in global.clist){
        // send json message
        if(global.clist[id][1].size) {
            res.json({status: 'Compiling', size: global.clist[id][1].size});
        } else {
        res.json({status: 'Compiling', size: "Null"});}
        
    }
    else if(id in global.dlist){
        // send json message
        if(global.dlist[id][1].size) {
            res.json({status: 'Done',url: '/download?id='+global.dlist[id][0], size: global.dlist[id][1].size});
        } else {
        res.json({status: 'Done', url: '/download?id='+global.dlist[id][0], size : "Null"});}
    }
    else if(id in global.faillist){
        // send json message
        res.json({status: 'Failed'});
    }
    else{
        // send json message
        res.json({status: 'Not in queue'});
    }

});
router.get('/download', limiter, function(req, res, next) {
    // get id
    var id = req.query.id;
    
    if(!id){
        // send json message
        res.json({status: 'No id provided'});
        return 0;
    }
    console.log("Download Request: \n ----- ",global.dlist[id], req.ip);
    // find id in queue lists
    if(id in global.dlist){
        // send file pipe
        if(fs.existsSync(global.compile_dir + id + ".mp3")){
            // get file from telegrama {
                var file = path.join(global.compile_dir + id + '.mp3');
                if(global.dlist[id][1].size) {
                var fileDetails = global.dlist[id][1];
                // download with fileName
                // convert " to '
                fileDetails.fileName = fileDetails.fileName.replace(/"/g, "'");
                res.download(file, fileDetails.fileName)
                } else {
                res.download(file);
                }
            } else {
                async function download() {
                    var file_link = await telegram_mod.getFile(global.dlist[id][1].file_id, id);
                    // download file_link from tg api
                    // get path of current directory
                    var file = fs.createWriteStream(global.compile_dir + id + '.mp3');
                    // import axios
                    if(!file_link) {
                        res.json({status: 'Failed',message: 'File link not found. sending for recompile..'});
                        // send for recompile
                        // delete from dlist
                        delete global.dlist[id];
                        // add to queue
                        queue.add(id);
                        return 0;
                    }
                    file_link = "https://api.telegram.org/file/bot" + process.env.TELEGRAM_TOKEN + "/" + file_link;
                    // download file and wait till finish
                    https.get(file_link, function(response) {
                        if(response.ok == 'false') {
                            console.log("Error: ", response);
                            res.json({status: 'Failed'});
                            return 0;
                        }
                        response.pipe(file);
                        // on pipe finish
                        file.on('finish', function() {

                            if(global.dlist[id][1].size) {
                            var fileDetails = global.dlist[id][1];
                            // download with fileName
                            // convert " to '
                            fileDetails.fileName = fileDetails.fileName.replace(/"/g, "'");
                            res.download(global.compile_dir + id + '.mp3', fileDetails.fileName)}
                        });
                    }
                    );
                    // send file
                    
                    }
            try { download(); } catch (error) { console.log(error); }
    
                
            }
                

    }
    else{
        // send json message
        res.json({status: 'Not ready'});
    }
});

module.exports = router;