const express = require('express');
require('dotenv').config()
const app = express();
const cors = require("cors");
const http = require('http');
const multiparty = require("connect-multiparty");
const { json } = require("body-parser");
const { pool } = require("./config/db/db");
var multer = require('multer');
const userRouter = require('./routes/user-routes');
const crypto = require('crypto');
const randomstring = require("randomstring");
const querystring = require('node:querystring');

var upload = multer({
    storage: multer.diskStorage({
        destination: './photos/',
        filename: async function(req, file, cb) {
            //req.body is empty...
            //How could I get the new_file_name property sent from client here?
            let newToken = crypto.randomBytes(48).toString('hex');
            console.log(file)
            cb(null, newToken + "." + file.mimetype.split('/')[1]);
        }
    })
});

const PORT = "8888";

const MultiPartyMiddleWare = multiparty({ uploadDir: './photos' });

app.use(cors());
app.use(json());
app.use(userRouter);
app.use('/photos', express.static(`${__dirname}/photos/`));

app.post('/ckuploads', MultiPartyMiddleWare, (req, res) => {
    console.log("Files to upload are ", req.files.upload);
    let x = req.files.upload.path;
    let y = x.split('\\');
    let path = y[1];
    res.send({ "uploaded": "true", "url": `http://localhost:8888/photos/${path}` })
});

// app.post('/photo/:id', upload.single('uploaded_file'), async(req, res) => {
//     // console.log(JSON.stringify(req.file))
//     console.log(req.file.filename)
//     try {
//         const result = await pool.query(`UPDATE users set profile_image=$1 where id=${req.params.id}
//          returning profile_image;`, [req.file.filename])
//         if (result) {
//             console.log(result.rows[0])
//             res.send(JSON.stringify({ photo: `http://localhost:8888/photos/${result.rows[0].profile_image}` }));
//         }
//     } catch (error) {
//         console.log(error);
//     }

// });

app.get('/main/user/:id', async(req, res) => {
    var userId = req.params.id;
    console.log(userId);
    try {
        const result = await pool.query('SELECT first_name,last_name,email,creation_date FROM members WHERE id=$1;', [userId]);
        if (result) {
            console.log(result.rows[0])
            res.status(200);
            res.send(JSON.stringify(result.rows[0]))
        }
    } catch (error) {
        res.send({
            status: 'ERROR',
            message: 'MAIN_USERNAME_RETRIEVAL_ERROR'
        })
        res.send(error)
    }
});

app.delete('/clear/:userId', async(req, res) => {
    const userId = req.params.userId;
    console.log(`userid when deleting is ${userId}`);
    try{
        await pool.query(`DELETE FROM sessions WHERE author_id=${userId};`)
    }catch(err){
        console.log('error while deleting ', err);
        res.status(500);
        res.send();
    }
    res.status(200);
    res.send();
});
//check if sessions already exists
app.post('/session/validate/:userId', async(req, res) => {
const { sessionToken } = req.body;
const { userId } = req.params

console.log(`userid is ${userId} and sessionToken is ${sessionToken}`);

const result = await pool.query(`SELECT id FROM sessions WHERE author_id=$1 AND session_token=$2;`, [userId, sessionToken])
if (result.rowCount === 1) {
    res.send(JSON.stringify({ 'status': 'success', message: 'VALID_SESSION' }));
} else {
    res.send(JSON.stringify({ 'status': 'error', message: 'INVALID_SESSION' }));
}
//res.send()
});

app.get('/spotify/login', function(req, res) {

    console.log('Log into spotify + clientId: ' + process.env.CLIENT_ID);

    var state = randomstring.generate(16);
    var scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
        state: state,
        response_type: 'token'   
      }));
  });


const server = http.createServer(app);

server.listen(PORT, (err) => {

    console.log(`Listening to http://localhost:${PORT}`)

});