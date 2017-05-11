var needle = require('needle');

/*
 * Formats the user inputted address which is currently inside the msg object.
 * The msg object is given from the 'hubot-conversation' package in order to
 * enable conversational dialog (read more at https://www.npmjs.com/package/hubot-conversation)
 * and formats it in a url encoded string so that it can be processed by the
 * Google Geocode API
 * @param {Object} msg
 * @param {String} apiKey
 * @param {String} botName. Default is "hubot"
 * @return {Object} the latitude and longitude of the user's inputted location
 * Note: may return more than one geocode depending on the location inputted.
 * You can easily configure the hubot to ask the user which location is correct
 */
function hubotGeocode (msg, apiKey, botName) {
  var addressToURL = msg.message.text;
  if (!botName) botName = "hubot";
  addressToURL = addressToURL.replace(botName + " ", "").replace(/\s/g, "+");
  //get request for geocode (lat, lng)
  needle.get("https://maps.googleapis.com/maps/api/geocode/json?address="+addressToURL+"&key="+apiKey, function (err, resp) {
    if (err) {
      return [{"status": 0, "error": err}];
    }
    var results = resp.body.results;
    var resultObject = {
      "status": 1,
      "error": null,
      "resultArray": []
    };
    results.forEach(function (location) {
      resultObject.resultArray.push({
        lat: location.geometry.location.lat,
        lng: location.geometry.location.lng
      });
    });
    return resultObject;
  });

}

module.exports = hubotGeocode;