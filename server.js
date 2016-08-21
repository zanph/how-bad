var http = require('http');
var fs = require('fs');
var url = require('url');
var through2 = require('through2');
var PATH = 'http://api.openweathermap.org/data/2.5/weather?q=Eugene,US&APPID=977c999ea8a4fa9a2b50236010738a61';

//var APIKEY; 
// api call format: //  http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID={APIKEY} 
// I need to be able to parse the user request's url for the city whose weather they want to compare to SF.
// Can I test this feature purely in the backend? Right now I'm just jumping straight to the API call.
// We have a URL -- localhost!! Get the parameter from the url
   function onRequest(request, response) {
      http.get('http://api.openweathermap.org/data/2.5/weather?q=Eugene,US&APPID=977c999ea8a4fa9a2b50236010738a61',
      (res) => {
         console.log(`Got response: ${res.statusCode}`)
         if (request.method === 'GET') {
            
            var parsed = url.parse(request.url, parseQueryString = true);
            console.log(parsed.query);
            var resbody = [];

            res.on('data', function(chunk) {
               resbody.push(chunk);
            }).on('end', function() {
               resbody = Buffer.concat(resbody);
               //console.log(`Can we print out a raw JSON property? : ${resbody.id}`);// no we can't. It's undefined.
               var jsn = JSON.parse(resbody);
               console.log(`Eugene,OR ID: ${jsn.id}`);
               //console.log(typeof jsn.id); // it's a number! That's why we need to toString() it below

               response.writeHead(200, {"Content-Type": "text/plain"});
               response.end(jsn.id.toString() + '\n');// you can only write back strings or buffers!!!
            });
         };
      else 
         (response.end('Send me a GET'));
      }).on('error', (err) => {
         console.log(`Got error: ${err.message}`);
      });
   };


   var server = http.createServer(onRequest);
   server.listen(8888);
   console.log('Server has started');
   console.log(url.parse(PATH, parseQueryString = true).query);
