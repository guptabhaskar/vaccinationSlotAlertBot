const Telegraf = require("telegraf")
let cred = require('./credentials.json')
const Bot_Token = cred.Bot_Token
const app = new Telegraf(Bot_Token)
const axios = require("axios")
let stateDistrictData = require('./StateDistrictData/state-district.json')
let districtData = require('./StateDistrictData/district-data.json')
let stateData = require('./StateDistrictData/state-data.json')

const {
  inlineMessageKeyboardForAge,
  inlineMessageKeyboardForPincodeDistrict,
  inlineMessageKeyboardForState,
  inlineMessageKeyboardForDistrict
} = require('./inLineMessages');
const {
  Client
} = require('pg');
const {
  addUser,
  addPincode,
  addDistrict
} = require('./databaseQueries')

const client = new Client({
  user: cred.user,
  host: cred.host,
  database: cred.database,
  password: cred.password,
  port: cred.port
});

client.connect();

// Start Command
app.command('/start', (ctx) => {
  ctx.reply('Hey, I am vaccineSlotAlertBot. I use Co-WIN Public APIs to check for available slots.')
  ctx.telegram.sendMessage(ctx.from.id, 'Enter your age?', inlineMessageKeyboardForAge)
})

// Age Actions
app.on('callback_query', (ctx) => {
  if (ctx.callbackQuery.data == 'all') {
    ctx.editMessageText('You chose age slab to be all age.')
    ctx.telegram.sendMessage(ctx.from.id, 'Check your nearest vaccination center and slots availability', inlineMessageKeyboardForPincodeDistrict)

    // Database Query
    addUser(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.chat.first_name, ctx.callbackQuery.data)
  } else if (ctx.callbackQuery.data == '18-44') {
    ctx.editMessageText('You chose age slab to be 18-44.')
    ctx.telegram.sendMessage(ctx.from.id, 'Check your nearest vaccination center and slots availability', inlineMessageKeyboardForPincodeDistrict)

    // Database Query
    addUser(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.chat.first_name, ctx.callbackQuery.data)
  } else if (ctx.callbackQuery.data == '45+') {
    ctx.editMessageText('You chose age slab to be 45+.')
    ctx.telegram.sendMessage(ctx.from.id, 'Check your nearest vaccination center and slots availability', inlineMessageKeyboardForPincodeDistrict)

    // Database Query
    addUser(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.chat.first_name, ctx.callbackQuery.data)
  } else if (ctx.callbackQuery.data == 'pincode') {
    ctx.editMessageText('You chose to get slots by pincode.')
    ctx.telegram.sendMessage(ctx.from.id, 'Enter your pincode in the next message as "/pincode 1100XX":')
  } else if (ctx.callbackQuery.data == 'district') {
    ctx.editMessageText('You chose to get slots by district.')
    ctx.telegram.sendMessage(ctx.from.id, 'Choose your state:', inlineMessageKeyboardForState)
  } else {
    var input = ctx.callbackQuery.data.slice(0, 10)
    if (input === 'stateInput') {
      input = ctx.callbackQuery.data.slice(11)
      ctx.editMessageText('You chose state ' + input)
      ctx.telegram.sendMessage(ctx.from.id, 'Choose your district:', inlineMessageKeyboardForDistrict(input))
    }
    input = ctx.callbackQuery.data.slice(0, 13)
    if (input === 'districtInput') {
      input = ctx.callbackQuery.data.slice(14)
      ctx.editMessageText('You chose district ' + input)
      addDistrict(ctx.callbackQuery.message.chat.id, districtData[input])
    }
  }
})

app.command('/pincode', (ctx) => {
  var pinCode = ctx.message.text.slice(9)
  const isValid = /^(^\d{6})$/.test(pinCode)
  if(!isValid){
    ctx.reply('Enter a valid pincode in the next message as "/pincode 1100XX":')
  } else {
    ctx.reply('Pincode entered by you is ' + pinCode + '.')
    addPincode(ctx.message.chat.id, pinCode)
  }
})

app.launch()

var minutes = 0.5,
  the_interval = minutes * 60 * 1000;
setInterval(function () {
  const query = `SELECT * FROM users`
  client.query(query, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    const data = res.rows;
    data.forEach(row => {
      if(row.pincode!=null){
        (async () => {
          const res = await getByPincode(row.pincode)
          for(const [k, center] of Object.entries(res['centers'])){
            sessions = []
            for(const [key, session] of Object.entries(center['sessions'])){
              if(session['available_capacity']>0){
                sessions.push(session)
              }
            }
            if(sessions.length>0){
              var out = "There are slots available at " + center['name'] +'(Address:'+center['address']+')\n'
              sessions.forEach(function (item, index) {
                item = JSON.stringify(item)
                out += item + '\n\n'
              });
              app.telegram.sendMessage(row.chatid, out)
            }
          }
        })()
      } else if(row.district!=null){
        (async () => {
          const res = await getByDistrictId(row.district)
          for(const [k, center] of Object.entries(res['centers'])){
            sessions = []
            for(const [key, session] of Object.entries(center['sessions'])){
              if(session['available_capacity']>0){
                sessions.push(session)
              }
            }
            if(sessions.length>0){
              var out = "There are slots available at " + center['name'] +'(Address:'+center['address']+')\n'
              sessions.forEach(function (item, index) {
                item = JSON.stringify(item)
                out += item + '\n\n'
              });
              app.telegram.sendMessage(row.chatid, out)
            }
          }
        })()
      }
    });
  });
  console.log("I am doing my 2 minutes check");
}, the_interval);

async function getByPincode(pincode){
  const config = {
    method: 'get',
    url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',
    params: { pincode: pincode, date: GetFormattedDate()},
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36', "Accept-Language": "en-US,en;"}
  }
  var res = await axios(config)
  return res.data
}

async function getByDistrictId(districtId){
  const config = {
    method: 'get',
    url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict',
    params: { district_id: districtId, date: GetFormattedDate()},
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36', "Accept-Language": "en-US,en;"}
  }
  var res = await axios(config)
  return res.data
}

function GetFormattedDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10) 
  {
      dd='0'+dd;
  } 
  if(mm<10) 
  {
      mm='0'+mm;
  } 
  return dd+'-'+mm+'-'+yyyy;
}