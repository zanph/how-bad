const http = require('http');
//var fs = require('fs');
const url = require('url');
//var through2 = require('through2');
const cityDB = require('./city.list.json');
const PATH = 'http://api.openweathermap.org/data/2.5/weather';
const CronJob = require('cron').CronJob;
//initialize module
var exports = module.exports = {};

// update SF weather every 20 minutes
var getSFWeather = {};
getSFWeather._CronJob = new CronJob('0 0,20,40 * * * * *', () => {
      var SFquery = url.parse(PATH, true);
      SFquery.query['id'] = 5391959;
      SFquery.query['units'] = 'imperial';
      SFquery.query['APPID'] = process.env.APIKEY;

      http.get(url.format(SFquery), (res) => {
          console.log(`Got SF weather; response code: ${res.statusCode}`);
          var resbody = [];

          res.on('data', (chunk) => {
              resbody.push(chunk);
          }).on('end', () => {
              resbody = Buffer.concat(resbody);
              var SFjsn = JSON.parse(resbody);
              getSFWeather.SFjsn = SFjsn; // SFjsn is the property of a global object
              console.log('***SF WEATHER***\n');
          });
      });
    },
    null, // no end function
    true, // start job immediately
    null // no time zone
    );



// api call format: //  http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID={APIKEY} 
function onRequest(request, response) {
    if (request.method === 'GET') {
        
        // parsedClientReq is the parsed curl request
        const parsedClientReq = url.parse(request.url, true);
        var apiQuery = url.parse(PATH, true);
        // next three lines need to be changed to handle more robust generalized validateReq
        const validatedQueryObj = validateReq(parsedClientReq.query);
        if (validatedQueryObj.flag !== 'OK') {
            console.error(`${validatedQueryObj.flag}`);
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end(`${validatedQueryObj.flag}`);
            process.exit;
        }

        else {
            // create appropriate query object depending on whether we're searching by
            // zip code or by IDs. Also, tell user to specify which city they want to
            // use in the case of multiple cities with the same name
            // by stringifying validatedQueryObj.cities and sending it over. Also
            // send specific errors to user.
            //
            // order: 1) check if zip code
            //       2) check if city, country pair
            //       3) check if city
            //       Remember. At this point we need to construct the actual API request
            if (validatedQueryObj.zip !== -1) {
               apiQuery.query['zip'] = validatedQueryObj.zip;
               apiQuery.query['units'] = 'imperial';
               apiQuery.query['APPID'] = process.env.APIKEY;
               callAPI(response, apiQuery);
            } 
            else if (validatedQueryObj.cities.length === 1) {
               apiQuery.query['id'] = validatedQueryObj.cities[0].id;
               apiQuery.query['units'] = 'imperial';
               apiQuery.query['APPID'] = process.env.APIKEY;
               callAPI(response, apiQuery);
            }
            else {
               if (validatedQueryObj.cities.length > 5) {
                  response.writeHead(200, {'Content-Type': 'text/plain'});
                  response.end('Too many cities with that name. Specify country code' + '\n');
               }
               else {
                  console.log(`cities length = ${validatedQueryObj.cities.length}`);
                  console.log(`flag: ${validatedQueryObj.flag}`);
                  response.writeHead(200, {'Content-Type': 'application/json'});
                  response.write(`Multiple cities named ${validatedQueryObj.cities[0].name}.`);
                  response.end(JSON.stringify(validatedQueryObj.cities));
               }
           }
       }
   }
    else {
      response.end('Send me a GET');
    }
}
function validateReq(clientReq) {
    // creates appropriate query object for api call via zipcode or city name
    // and checks it against the world city database. If city name & country
    // are found, prepares to call API with unique city ID.
    // Returns 1 if we have a valid query, 0 otherwise
    // if there is a mix of digits and letters, it's invalid.
    //
    // if it has length 1, check if it has digits
    // else, check if its just letters, then assume its a city (insert function call 
    // here to look up cities)
    // SHOULD ONLY RETURN ONE OBJECT, WHICH COULD CONTAIN A LIST OF CITY OBJECTS (ID/NAME)
    // AND A ERROR OR SUCCESS FLAG
    // mainObj.cities will be a list of city objects name and ID keys 
    var mainObj = {};
    const len1Re = /[A-Za-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]/;
    if (/[!@#$%^&*()_+=\[\]{}\|\/\?\\;<>-]+/.test(clientReq['userLocation'])) {
      mainObj.flag = 'ERROR: Invalid characters. Enter a US zip code or a city and country, separated by commas';
      return mainObj;
    }
    var trimmed = clientReq['userLocation'].split(',').map(function (element) {
        return element.trim();
    });
    const city = trimmed[0];

    if (trimmed.length === 1) {
        //maybe validate city here.
        if (/^\d+$/.test(trimmed[0])) {
            
            const zipRe = /^[1-9]\d{3,4}$/;
            if (trimmed[0].match(zipRe)) {     //  call API by zipcode
                mainObj.zip = trimmed[0].match(zipRe) + ',US'; 
                mainObj.flag = 'OK';
                return mainObj;
            }
            else {
                console.log(`invalid query ${clientReq['userLocation']}`);
                mainObj.flag = 'ERROR: Invalid zip'; // invalid zipcode. We know it's a malformed zipcode, though.
                // add more specific error handling!
                return mainObj;
            }
        }
        else if (city.match(len1Re)) {
            mainObj.zip = -1;
            mainObj.cities = findID(cityDB, city); 
            mainObj.flag = mainObj.cities.length >= 1 ? 'OK' : 'ERROR: city not found';
            return mainObj;
        }

        else {
            console.log('it is exceedingly unlikely that we should be here');
            mainObj.flag = 'ERROR: UNLIKELY';
            return mainObj;
        }
    }
    else { // assume client is searching by city and country
        const country = trimmed[1];
        
        mainObj.zip= -1; // sentinel value
        mainObj.cities = findID(cityDB, city, country);
        mainObj.flag = mainObj.cities.length === 1 ? 'OK' : 'ERROR: city not found OR multiple city/country pairs exist';
        return mainObj;
    }
}

function findID(cityDB, city, country) {
    // search cityDB for queried city and country.
    // if found, return matching db object, else, return undefined
    // for now, return first match
    // must address possibility of multiple matches
    // ALWAYS RETURN LIST OF OBJECTS WITH SAME PROPERTIES: .ID AND .NAME
    var ids = [];
    var obj = {};
    if (arguments.length === 3) { // then we're searching for a city country pair
        for (let i = 0; i < cityDB.length; i++) {
            if (cityDB[i].name === city && cityDB[i].country === country) {
                console.log(`I found id ${cityDB[i]._id} matching city ${city},${country}`);
                obj.name = cityDB[i].name;
                obj.id = cityDB[i]._id;
                ids.push(obj);
                return ids;
            }
            else continue;
        }
        return {}; // empty object  -- city/country not found
    }
    else if (arguments.length === 2) { // then we're searching solely by city name
        for (let i = 0; i < cityDB.length; i++) {
            if (cityDB[i].name === city) {
                obj.name = cityDB[i].name;
                obj.id = cityDB[i]._id;
                ids.push(obj); 
            }
            else continue;
        }
    }
    return ids;
}

function callAPI(response, apiReq) {

   console.log('parsed url sent to openweather: ' + url.format(apiReq));
   // I need to refactor the streaming of the get request to use through2.
   // Should be significantly fewer lines
   http.get(url.format(apiReq), (res) => {
       console.log(`Got response: ${res.statusCode}`);
       var resbody = [];

       res.on('data', function(chunk) {
           resbody.push(chunk);
       }).on('end', function() {
           resbody = Buffer.concat(resbody);
           //console.log(`Can we print out a raw JSON property? : ${resbody.id}`);// no we can't. It's undefined.
           const queryJSN = JSON.parse(resbody);
           console.log(queryJSN);
           console.log('The weather in ' + queryJSN.name + ' is ' + queryJSN.weather[0].description +
              '. It\'s currently ' + queryJSN.main.temp + ' degrees K');
           //console.log(typeof queryJSN.id); // it's a number! That's why we need to toString() it below

           response.writeHead(200, {'Content-Type': 'application/json'});
           response.write(JSON.stringify(queryJSN));
           response.write('------------------------------------------\n');
           response.end(JSON.stringify(compareWeather(getSFWeather.SFjsn, queryJSN)));
           // you can only write back strings or buffers!!!;
       }).on('error', (err) => {
           console.log(`Got error: ${err}`);
       });
   });
}

// takes two parsed json weather objects. returns an object containing
// a property saying where the weather is better, and another property
// explaining why. The code above as is already sends a JSON object back
// to the client describing the weather there
// simple conditions first. DO NOT MAKE THIS UNNECESSARILY COMPLICATED
//   *clear in SF beats everything else. Even if it's hot. It's a dry heat, after all.
//   *if both clear, compare humidity and temp. SF will probably win by default
//   *if both cloudy, probably nicer in SF. Compare temp and humidity
//   *possible case of a DRAW? Could be kinda funny. 
//   *storming/raining in SF vs. clear anywhere else, query wins
// 
function compareWeather(jsnSF, jsnQuery) {
   //console.log('in compareWeather jsnSF is ');
   //console.log(jsnSF);
   var comparison = {};
   var SFweather = jsnSF.weather[0].id;
   var qweather = jsnQuery.weather[0].id;
   var SFtemp = jsnSF.main.temp;
   var qtemp = jsnQuery.main.temp;
   var SFhumidity = jsnSF.main.humidity;
   var qhumidity = jsnQuery.main.humidity;

   if (SFweather === 800) { // clear sky
      comparison.result = 'SF';
      comparison.summary = 'it\'s clear in SF. Win by default, even if it\'s hot' +
         'after all, it is a dry heat';
   }
   else if ((SFweather >= 801 && SFweather <= 804) && (qweather >= 801 && qweather <= 804)) {
      if ((SFhumidity >= 45 && SFhumidity <= 65) && (SFtemp >= 60 && SFtemp <= 74)) {
         comparison.result = 'SF';
         comparison.summary = 'temperature/humidity butter zone. Win by default';
      }
      else if ((qhumidity >= 45 && qhumidity <= 65) && (qtemp >= 60 && SFtemp <= 74)) {
         comparison.result = `${jsnQuery.name}`;
         comparison.summary = 'It\'s cloudy in both San Francisco and ' + jsnQuery.name +
            ', but your city\'s in the butter zone. Congratulations. Enjoy it while it lasts';
      }
      else {
         comparison.result = 'DRAW';
         comparison.summary = 'The weather sucks in both places today. It happens.';
      }
   }
   
   else if ((qhumidity >= 45 && qhumidity <= 65) && (qtemp >= 60 && SFtemp <= 74)) {
      comparison.result = `${jsnQuery.name}`;
      comparison.summary = jsnQuery.name + ' is in the butter zone. Enjoy it while it lasts.' +
          ' Eat at Arby\'s.';
   }
   else {
      comparison.result = 'DRAW';
      comparison.summary = 'The weather sucks in both places today. It happens.';
   }

   return comparison;
}

var server = http.createServer(onRequest);
server.listen(8888);
console.log('Server has started');
exports.validateReq = validateReq;
exports.findID = findID;
exports.callAPI = callAPI;

