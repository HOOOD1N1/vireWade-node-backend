const { pool } = require('../config/db/db');
const crypto = require('crypto');

module.exports = {


    create: async(params) => {
        const { userId } = params
        var sessionId;
        let sessionToken;
        try {
            // const {cryptoRandomString} = await import("crypto-random-string");
            // console.log('HEREEEE: ' + cryptoRandomString({ length: 10, type: 'base64' }));
            sessionToken = crypto.randomBytes(48).toString('base64url');
            console.log('create session: done' + `sessionToken is ${sessionToken}`);
            //sessionToken = '123467';
            const takeId = await pool.query(`insert into sessions(author_id, session_token) values(${userId}, '${sessionToken}') RETURNING id;`);
           
            sessionId = takeId.rows[0].id;

        } catch (err) {
            console.error(err);
            console.log('authenticate: undone');
        }
        return {
            status: 'success',
            message: 'SESSION_CREATED_SUCCESSFULLY',
            payload: {
                userId: userId,
                sessionId: sessionId,
                sessionToken: sessionToken
            }
            // Bearer: userId-sessionId-sessionToken
            // headers.authentication split('-')
        }
    },
    read: async(params) => {

    },
    update: async(params) => {

    },
    remove: async(params) => {},
    validate: async(params) => {

        const { userId, sessionId, sessionToken } = params;
        if (userId && sessionId && sessionToken) {
            const validSession = await pool.query('select id from sessions where id=$1 and author_id=$2 and session_token=$3', [Number(sessionId), Number(userId), sessionToken])
            if (validSession.rowCount > 0) {
                return true
            } else {
                return false
            }
        } else return false;
    }

}