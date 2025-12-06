// ----------------Importing Modules ----------------
const pool = require("../lib/pgclient");


// ---------------Functions------------------

const checkRoom = async (roomName) => {
    let client;
    try{
        client = await pool.connect();
        const result = await client.query(
            "SELECT * FROM rooms WHERE name = $1",
            [roomName]
        )
        if(result.rows.length == 0){
            return false;
        }
        return true;
    }
    catch(err){
        console.log(err);
        throw err;
    } finally {
        if(client) client.release();
    }
}

const createRoom = async (roomName) => {
    let client;
    try{
        client = await pool.connect();
        await client.query(
            "INSERT INTO rooms (name) VALUES ($1)",
            [roomName]
        );
    }
    catch(err){
        console.log(err);
        throw err; 
    } finally {
        if(client) client.release();
    }
}

const joinRoom = async (username,roomName) => {
    let client;
    try{
        client = await pool.connect();
        const result = await client.query(
            "SELECT roomId FROM rooms WHERE name = $1",
            [roomName]
        )
        if (result.rows.length > 0) {
            const roomId = result.rows[0].roomid;

            const res2 = await client.query(
                "UPDATE users SET roomid = $1 WHERE username = $2",
                [roomId, username]
            );
            if(res2.rowCount > 0){
                return true;
            }
        }

        return false;
    }
    catch(err){
        console.log(err);
        throw err;
    } finally {
        if(client) client.release();
    }
}

module.exports = {checkRoom, createRoom, joinRoom};