// // // express hello world
// // var express = require('express');
// // var app = express();
// // const fs = require('fs');
// // const path = require('path');

// // const express = require('express');
// // const cors = require('cors'); // This is the line that was crashing
// // const app = express();

// // app.use(cors()); // This tells the server to allow requests from your React app
// // global.app_config = {
// //     serverless : true
// // }
// // global.compile_dir = path.join(__dirname) + '/compiled/';
// // var PORT = 3000;
// // var api =  require('./api/routes.js');
// // // all cors
// // app.use(function(req, res, next) {
// //     res.header("Access-Control-Allow-Origin", "*");
// //     res.header("Access-Control-Allow-Headers", "*");
// //     next();
// // });

// // app.get('/*',api);

// // app.listen(PORT, function () {
// //     console.log(` ---- MP3 IS SERVING MUSIC  ---- `);
// //     console.log(`  - ON PORT ${PORT}  `);
// //     // delete compiled and songs folder if exists
// //     if (fs.existsSync('./compiled')) {
// //         fs.rmSync('./compiled', { recursive: true });
// //     }
// //     if (fs.existsSync('./songs')) {
// //         fs.rmSync('./songs', { recursive: true });
// //     }
// //     // create compiled and songs folder
// //     fs.mkdirSync('./compiled');
// //     fs.mkdirSync('./songs');
    
// //     if (fs.existsSync('./dlist.json')) {
// //         global.dlist = JSON.parse(fs.readFileSync('./dlist.json'));
// //     }
// // });
    
// // module.exports = app;




// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const PORT = 3000;

// // ✅ 1. Use the CORS middleware correctly
// app.use(cors());

// // ✅ 2. Global Configurations
// global.app_config = {
//     serverless: true
// };
// global.compile_dir = path.join(__dirname, 'compiled');

// // ✅ 3. Load Routes
// const api = require('./api/routes.js');

// // Standard Middleware
// app.use(express.json());

// // ✅ 4. Route Handling
// // This will pass all requests starting with / to your routes.js
// app.use('/', api);

// // ✅ 5. Server Startup & Folder Management
// app.listen(PORT, function () {
//     console.log(` ---- MP3 IS SERVING MUSIC  ---- `);
//     console.log(`  - ON PORT ${PORT}  `);

//     // Delete compiled and songs folder if they exist to start fresh
//     if (fs.existsSync('./compiled')) {
//         fs.rmSync('./compiled', { recursive: true });
//     }
//     if (fs.existsSync('./songs')) {
//         fs.rmSync('./songs', { recursive: true });
//     }

//     // Create fresh compiled and songs folders
//     fs.mkdirSync('./compiled');
//     fs.mkdirSync('./songs');
    
//     // Load download list if it exists
//     if (fs.existsSync('./dlist.json')) {
//         global.dlist = JSON.parse(fs.readFileSync('./dlist.json'));
//     }
// });

// module.exports = app;







const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// ✅ Allow React to communicate with this server
app.use(cors());
app.use(express.json());

global.app_config = { serverless: true };
global.compile_dir = path.join(__dirname, 'compiled');

const api = require('./api/routes.js');
app.use('/', api);

app.listen(PORT, function () {
    console.log(` ---- MP3 IS SERVING MUSIC ---- `);
    console.log(` - ON PORT ${PORT} `);

    // Fresh start for folders
    if (fs.existsSync('./compiled')) fs.rmSync('./compiled', { recursive: true });
    if (fs.existsSync('./songs')) fs.rmSync('./songs', { recursive: true });
    fs.mkdirSync('./compiled');
    fs.mkdirSync('./songs');
});