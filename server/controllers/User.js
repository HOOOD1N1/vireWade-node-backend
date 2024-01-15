const { pool } = require('../config/db/db');
const bcrypt = require('bcrypt')
const Sessions = require('./Sessions')
module.exports = {

    create: async(params) => {
        const { firstName, lastName, password, email } = params;
        console.log("firstName " + firstName + "lastName " + lastName + " password " + password + " email " + email);
        if (firstName && lastName && password && email) {
            try {
                const userExists = await pool.query('SELECT id FROM members where email=$1', [email])
                if (
                    // userExists ? .rows[0] ? .id
                    userExists && userExists.rows && userExists.rows[0] && userExists.rows[0].id
                ) {
                    return {
                        status: 'error',
                        message: 'USER_ALREDY_REGISTERED'
                    }
                }
                const date = new Date();
                const hash = await bcrypt.hash(password, 10);
                console.log("password is" + hash + "" + typeof(hash));
                const result = await pool.query('INSERT INTO members (email, first_name, last_name, password, creation_date) VALUES ($1, $2, $3, $4, $5) returning id', [email, firstName, lastName, hash, date])
                if (result.rowCount === 1) {
                    // const sessionResult = Sessions.create({ userId: result.rows[0].id })
                    // console.log('authenticate: done');
                    
                    return {
                        status: 'success',
                        message: 'USER_REGISTERED_SUCCESSFULLY',
                        payload: (await sessionResult).payload
                    }
                }
            } catch (err) {
                console.error("there is an error", err)
                return {
                    status: 'error',
                    message: 'ERROR_REGISTERING_USER'
                }
            }
        } else {
            return {
                status: 'error',
                message: 'MISSING_PARAMETERS'
            }
        }
    },
    authenticate: async(params) => {
        const { email, password } = params;
        if (email && password) {
            try {
                const resultUser = await pool.query('SELECT id, email, password from members where email=$1', [email])
                if (resultUser.rowCount === 1) {
                    const hash = resultUser.rows[0].password
                    const samePassword = await bcrypt.compare(password, hash)
                    if (samePassword === true) {
                        // password is correct
                        // const sessionResult = Sessions.create({ userId: resultUser.rows[0].id })
                        console.log('authenticate: done');
                        return {
                            status: 'success',
                            message: 'USER_IS_AUTHENTICATED',
                            payload: (await sessionResult).payload
                        }
                    } else {

                        return {
                            status: 'error',
                            message: 'FAILED_COMPARING_PASSWORDS'
                        }
                    }
                }
            } catch (err) {
                console.error(err)
                return {
                    status: 'error',
                    message: 'FAILED_EXECUTING_QUERY'
                }
            }
        } else {
            return {
                status: 'error',
                message: 'MISSING_PARAMETERS'
            }
        }
    },
    update: async(params) => {},
    remove: async(params) => {},
    read: async(params) => {
        // find user
    }

}