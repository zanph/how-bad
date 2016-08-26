var http = require('http');
var fs = require('fs');
var url = require('url');
//var through2 = require('through2');
var cityDB = require('./city.list.json');
var PATH = 'http://api.openweathermap.org/data/2.5/weather';

// api call format: //  http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID={APIKEY} 
   function onRequest(request, response) {
         if (request.method === 'GET') {
            
            // parsedClientReq is the parsed curl request
            var parsedClientReq = url.parse(request.url, parseQueryString = true);
            var apiReq = url.parse(PATH, parseQueryString = true);
            // validateReq modifies the api query object as a side effect. This is by design.
            if (!validateReq(parsedClientReq.query, apiReq.query)) {
               console.error(`Error: invalid query ${parsedClientReq}`);
               process.exit;
            }

            else {

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
                     var jsn = JSON.parse(resbody);
                     console.log(jsn);
                     console.log(`The weather in ${jsn.name} is ${jsn.weather[0].description}. It\'s 
                           currently ${jsn.main['temp']} degrees K.`);
                        //console.log(typeof jsn.id); // it's a number! That's why we need to toString() it below

                     response.writeHead(200, {"Content-Type": "text/plain"})
                     // you can only write back strings or buffers!!!;
                     response.end(`${jsn.name.toString()}, ${jsn.sys.country.toString()}:
                            ${jsn.weather[0].description.toString()} and ${jsn.main.temp.toString()} degrees K`);
                     }).on('error', (err) => {
                     console.log(`Got error: ${err}`);
                  });
               });
            }
        } 
         else response.end('Send me a GET');
   };

   function validateReq(clientReq, apiQuery) {
      // creates appropriate query object for api call via zipcode or city name
      // and checks it against the world city database. If city name & country
      // are found, prepares to call API with unique city ID.
      // Returns 1 if we have a valid query, 0 otherwise
      zipRe = /\s*[^A-Za-z][1-9]\d{3,4}$/;
      if (clientReq['q'].match(zipRe)) {     //  call API by zipcode
         apiQuery['zip'] = clientReq['q'].match(zipRe) + ',US';
         apiQuery['APPID'] = process.env.APIKEY;
          
         return 1;
      }
      else { // assume client is searching by city
        separated = clientReq['q'].split(',');
        city = separated[0].trim();
        country = separated[1].trim();
        id = findID(cityDB, city, country); 
        
        if (id !== 0) {
           apiQuery['id'] = id;
           apiQuery['APPID'] = process.env.APIKEY;
        
           return 1;
        }
        else {
           return 0;  // 0 indicates clientReq not found in db
        }
      }
   };

   function findID(cityDB, city, country) {
      // search cityDB for queried city and country.
      // if found, return matching db object, else, return undefined
      // for now, return first match
      // must address possibility of multiple matches
      for (var i = 0; i < cityDB.length; i++) {
         if (cityDB[i].name === city && cityDB[i].country === country) {
            console.log(`I found id ${cityDB[i]._id} matching city ${city},${country}`);
            return cityDB[i]._id;
         }
         else continue;
      }
         return 0; // sentinel value -- city/country not found
   };



   var server = http.createServer(onRequest);
   server.listen(8888);
   console.log('Server has started');

   // actual city comparison operation
   //function compare() {
   //};
