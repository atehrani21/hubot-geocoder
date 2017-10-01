# hubot-geocoder
A geocoder for hubot that utilizes the hubot-conversation package and Google Maps API to return position coordinates based on a user inputted address.

## Installation

1. Install through npm

```
npm install --save hubot-geocoder
```
2. Setup a Google Maps API Key

The [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/get-api-key) allows you to setup an API key easily. Go ahead and follow the steps there.

3. Setup a Hubot Chatbot

If you haven't done so already, head on over to the [Hubot Page](https://hubot.github.com) and set up a personal hubot for yourself.

## Usage

hubot-geocoder is intended to be used with a conversational dialog between the bot and the user. The current package being used for this is the [hubot-conversation](https://www.npmjs.com/package/hubot-conversation) package available on npm. It provides a convenient way for two-way conversation. Make sure you have this package installed and require it in your hubot script file. 

### Simple call to retrieve geocoordinates

Retrieving the user's latitude and longitude values requires a call to the `hubotGeocode` function which utilizes the Google Maps API to return the most accurate results.

```javascript
hubotGeocode(userMessage, apiKey, botName, (err, resp) => {
	if (err) console.log("error: " + err);
	else {
		console.log("coordinates below");
		console.log(resp);
	}
});
```
### Parameter Details

* `userMessage` - The message entered by the user containing their location information (address or zip code) formatted with the hubot-conversation `dialog` object.
* `apiKey` - Your Google Maps API key used to call the Maps API to get the user's geocoordinates
* `botName` - The name of your hubot (e.g. restaurantbot). If you don't have a custom name for your bot, enter `null` or `""`
* `callback` - The callback function that will contain either an error if call to API was unsuccessful or a `response` object with the user's latitude and longitude if successful

### Response Object

If hubot-geocoder was successful in retrieving the user's coordinates, a `response` array of objects will be contained within the callback. Usually the array will only contain one element, which is the object containing the user's `lat` and `lng` values. If multiple geocoordinates were returned (which can be the case if the user's location is too broad or associated with multiple locations), you can easily create another dialog to ask the user to specify which location.

```javascript
[ { lat: 40.77664120000001,
    lng: -73.9521468,
    location: 'New York, NY 10028, USA' } ]
``` 

Below is a sample usage using ES6 JavaScript.

```javascript
const Conversation = require('hubot-conversation');
const hubotGeocode = require('hubot-geocode');
const needle = require('needle');

function hubotRestaurant (robot) {
  const switchBoard = new Conversation(robot);
  robot.hear(/get restaurants near me/, (msg) => {
    let dialog = switchBoard.startDialog(msg);
    msg.reply('Sure, What is your address or city, state? (e.g. New York, NY or 132 Main St, New York, NY)');

    dialog.addChoice(/(^)/i, (msg2) => {
      /*
      * the geocode function returns an object that contains an array of latitudes and longitudes. In most cases,
      * there will be only one entry in that array, but sometimes the inputted location may return more than one pair of coordinates.
      * The inputs are msg2 (the message from the hubot-conversation dialog function), apiKey (your google maps api key),
      * botName (your hubot's name. hubot is the default value if you don't have a custom bot set up.)
      */

      let apiKey = "<your-google-maps-api-key>";

      // calling the geocoding function
      hubotGeocode(msg2, apiKey, "restaurantbot", (err, resp) => {
        if (err) {
          msg.reply("Oh no! Something went wrong while I was trying to get your coordinates. Check back in a bit, I'll get on it!");
          return;
        }
        let options = {
          headers : {
            'Content-Type': 'application/json'
          },
          location: resp[0].lat + "," + resp[0].lng,
          radius: 500,
          type: 'restaurant'
        };
        // get nearest restaurants by calling the google places api
        needle.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+options.location+"&radius=5000&type=restaurant&key="+apiKey,
          (err, resp) => {
            if (err) {
              console.log("error!!");
              console.log(err);
              msg2.reply("Oh no, an error occured :(");
            } else {
              console.log("success!!");
              console.log(resp.body);
              resp.body.results.forEach(function (restaurant) {
                msg2.emote(restaurant.name + ", " + restaurant.vicinity);
              });
              msg2.reply("Got back something! Check the console");
            }
          });
      });
    });
  });
}

module.exports = hubotRestaurant;
```

### Notes
* The hubot-conversation package is required in order for the geocoder to properly return the inputted coordinates. This is because we want our hubot to utilize the returned coordinates in further api calls, such as getting closest restaurants.
* More than one pair of geocoded coordinates may be returned by the geocoder. If that is the case, you want to make sure the first object (resp[0]) contains the actual coordinates you want. To go around this, you could ask the user to select the correct location from the array of results.

## Planned Features

* Reverse geolocation
* Custom regular expressions for messages that the user can send

hubot-geocoder is a constant work in progress, so if you would like to help with these features or suggest a custom feature, feel free to contribute!

### How to Contribute

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request, and your done!

## License

Licensed under the [MIT License](./LICENSE.md).