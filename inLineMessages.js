const Telegraf = require("telegraf");
const {
    Markup
} = Telegraf
let jsonData = require('./StateDistrictData/state-district.json');
let stateData = require('./StateDistrictData/state-data.json');
let districtData = require('./StateDistrictData/district-data.json');

const inlineMessageKeyboardForAge = Markup.inlineKeyboard([
    Markup.callbackButton('All Age', 'all'),
    Markup.callbackButton('Age 18-44', '18-44'),
    Markup.callbackButton('Age 45+', '45+')
]).extra()

const inlineMessageKeyboardForPincodeDistrict = Markup.inlineKeyboard([
    Markup.callbackButton('Search By Pincode', 'pincode'),
    Markup.callbackButton('Search By District', 'district'),
]).extra()

// Create inLineKeyBoardState
function createinLineKeyBoardState() {
    var StateNames = []
    var i = 0
    var curr = []
    for (const [key, value] of Object.entries(stateData)) {
        i = i + 1;
        curr.push(Markup.callbackButton(key, 'stateInput ' + key));
        if (i % 2 == 0) {
            StateNames.push(curr);
            curr = []
        }
    }
    if (i % 2 != 0) {
        StateNames.push(curr);
    }
    return StateNames
}
const inlineMessageKeyboardForState = Markup.inlineKeyboard(createinLineKeyBoardState()).extra()

// Create inLineKeyboardDistrict
function createinLineKeyBoardDistrict(stateId) {
    var districtNames = []
    var i = 0
    var curr = []
    for (const [key, value] of Object.entries(jsonData[stateId])) {
        i = i + 1;
        curr.push(Markup.callbackButton(value['district_name'], 'districtInput ' + value['district_name']));
        if (i % 3 == 0) {
            districtNames.push(curr);
            curr = []
        }
    }
    if (i % 3 != 0) {
        districtNames.push(curr);
    }
    return districtNames
}

function inlineMessageKeyboardForDistrict(stateName) {
    return Markup.inlineKeyboard(createinLineKeyBoardDistrict(stateData[stateName])).extra()
}

module.exports = {
    inlineMessageKeyboardForAge,
    inlineMessageKeyboardForPincodeDistrict,
    inlineMessageKeyboardForState,
    inlineMessageKeyboardForDistrict
};