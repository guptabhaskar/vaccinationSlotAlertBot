const {
  Client
} = require('pg');
const cred = require('./credentials.json')

const client = new Client({
  user: cred.user,
  host: cred.host,
  database: cred.database,
  password: cred.password,
  port: cred.port
});

client.connect();

function addUser(chatid, firstname, age) {
  const query = `INSERT INTO users (chatid, firstname, age) VALUES ($1, $2, $3) ON CONFLICT (chatid) DO UPDATE SET firstname = excluded.firstname, age = excluded.age;`
  const values = [chatid, firstname, age]
  client.query(query, values, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('User added to database');
  });
}

function addPincode(chatid, pincode) {
  const query = `UPDATE users SET pincode = $2, district = NULL WHERE chatid = $1;`
  const values = [chatid, pincode]
  client.query(query, values, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Added pincode to user');
  });
}

function addDistrict(chatid, districtid) {
  const query = `UPDATE users SET pincode = NULL, district = $2 WHERE chatid = $1;`
  const values = [chatid, districtid]
  client.query(query, values, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Added districtid to user');
  });
}

module.exports = {
  addUser,
  addPincode,
  addDistrict
};