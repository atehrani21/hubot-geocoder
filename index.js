// Needle dependency to run app
const needle = require('needle');

/*
 * Formats the user inputted address which is currently inside the msg object.
 * The msg object is given from the 'hubot-conversation' package in order to
 * enable conversational dialog (read more at https://www.npmjs.com/package/hubot-conversation)
 * and formats it in a url encoded string so that it can be processed by the
 * Google Geocode API
 * @param {Object} msg
 * @param {String} apiKey
 * @param {String} botName. Default is "hubot"
 * @param {Function} callback - the callback function processed on the client
 * @return {Object} the latitude and longitude of the user's inputted location
 * Note: may return more than one geocode depending on the location inputted.
 * You can easily configure the hubot to ask the user which location is correct
 */
function geocode (msg, apiKey, botName, callback) {
  let addressToURL = msg.message.text;
  if (!botName) botName = "hubot";
  addressToURL = addressToURL.replace(botName + " ", "").replace(/\s/g, "+");
  //get request for geocode (lat, lng)
  needle.get("https://maps.googleapis.com/maps/api/geocode/json?address="+addressToURL+"&key="+apiKey, (err, resp) => {
    if (err) {
      callback(err, "There was an error retrieving your coordinates, please try again later.");
      return;
    }
    let results = resp.body.results;
    let resultArray = [];
    results.forEach( (location) => {
      resultArray.push({
        lat: location.geometry.location.lat,
        lng: location.geometry.location.lng,
        location: location.formatted_address
      });
    });
    callback(null, resultArray);
  });

}

module.exports = geocode;