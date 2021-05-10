const { Client } = require('pg');
const cred = require('./credentials.json')

const client = new Client({
    user: cred.user,
    host: cred.host,
    database: cred.database,
    password: cred.password,
    port: cred.port
  });

client.connect();

const query = {
    text: `
        DROP TABLE users;
        CREATE TABLE users(
        chatid bigint PRIMARY KEY NOT NULL, 
        firstname varchar(50) NOT NULL,
        age varchar(50) NOT NULL,
        pincode varchar(50),
        district varchar(50),
        lastnotified timestamp
        );
        `
}

client.query(query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Table is successfully created');
});