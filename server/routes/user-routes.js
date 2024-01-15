const router = require('express').Router();
const User = require("../controllers/User.js");
const { pool } = require("../config/db/db.js");

router.post('/users', async(req, res) => {
    //const id = parseInt(request.params.id)
    const { id, name, email } = req.body
    const password = 123;
    const date = new Date();
    const result = await pool.query(
        'INSERT INTO users (id, username, email, password, creation_date) VALUES ($1, $2, $3, $4, $5)', [id, name, email, password, date])

    res.status(201).send(`User added with ID: ${result.insertId}`)

});
router.get('/users_all', async(req, res) => {
    const result = await pool.query('SELECT * FROM users;')
    res.status(201).json(result.rows)
});

router.post('/login', async(req, res) => {
    console.log("login")

    const { email, password } = req.body;
    const result = await User.authenticate({ email: email, password: password })
    console.log('here is payload' + JSON.stringify(result.payload));
    if (result) {
        res.send(JSON.stringify(result));
    }
});

router.post('/register', async(req, res) => {
    console.log("register")
    const result = await User.create(req.body)
    console.log("result is " + JSON.stringify(result))
    if (result) {
        console.log("there is a result")
        const { status, message } = result;
        if (status === 'error') {
            res.status(500);
            res.send(result);
        } else {
            res.send(result)
        }
    }
})

router.get('/taskbar/photo/:userId', async(req, res) => {
    let userId = req.params.userId;
    try {
        let result = await pool.query('SELECT profile_image, username from users WHERE id=$1;', [userId]);
        if (result.rows) {
            console.log(result.rows)
            res.json(result.rows);
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }

});



module.exports = router;