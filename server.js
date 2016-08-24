var http = require('http');
var fs = require('fs');
var url = require('url');
//var through2 = require('through2');
var cityDB = require('./city.list.json');
var PATH = 'http://api.openweathermap.org/data/2.5/weather';

// api call format: //  http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID={APIKEY} 
   function onRequest(request, response) {
         if (request.method === 'GET') {
            
            var parsedClientReq = url.parse(request.url, parseQueryString = true);
            var parsed = url.parse(PATH, parseQueryString = true);
            // add logic to differentiate between when user asks for direct city name or id
            validateReq(parsed.query);

            parsed.query['q'] = parsedClientReq.query['q'];
            parsed.query['APPID'] = process.env.APIKEY;
            console.log('parsed url sent to openweather: ' + url.format(parsed));
            
            http.get(url.format(parsed), (res) => {
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
         else response.end('Send me a GET');
   };

   function validateReq(query) {
      // creates appropriate query object for api call via zipcode or city name
      // and checks it against the world city database
      // May be better to search the DB for the city, and then just call the API
      // using it's unique ID. 
      zipRe = /\s*[^A-Za-z][1-9]\d{3,4}$/;
      if (zipRe.match(query)) { // match, call API by zipcode
         zip = zipRe.match(query);
         query['zip'] = zip + ',US';
      }
      else { // assume client is searching by city
        separated = query.split(',');
        city = separated[0].trim();
        country = separated[1].trim();
        query['q'] = city + ',' + country;
      }


   }


   var server = http.createServer(onRequest);
   server.listen(8888);
   console.log('Server has started');
   
   function compare() {
   };
