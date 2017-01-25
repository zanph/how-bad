# how-bad
How bad is the weather at your location relative to SF? Don't take this too seriously.

clone repo, run `node server.js`, then `curl localhost:8888/?userLocation=Chicago,US`
Replace Chicago with whatever city and country code you want. We can also query by zipcode!

`curl localhost:8888/?userLocation=60612`

Note that you'll get a raw JSON response -- with the first object being the raw API response,
and the second being an object containing the result of the comparison. Cleaning this up has 
been on the backburner for a while, as my primary interest was getting semi-robust error-checking 
working.

