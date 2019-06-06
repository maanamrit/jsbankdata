require('dotenv').config()
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.MAPS_API_KEY
});
const fs = require('fs');
const path = require('path');
const os = require('os');
var args = process.argv;
var stringify = require('csv-stringify');
const csv = require('csv-parser');

const gmaps = q => { 
 googleMapsClient.places({
  query: q
}, function(err, response) {
  if (!err) {
	const output = [];
    var res = response.json.results;
	res.forEach(function (val, index, array) {
			const row = [];
		    row.push(val.name);
			row.push(val.formatted_address);
			row.push(val.geometry.location.lat);
			row.push(val.geometry.location.lng);
			output.push(row);
		});
	stringify(output, (err, output) => {
       if (err) throw err;
	   const filename = path.join(__dirname, q+'.csv');
       fs.writeFile(filename, output, (err) => {
         if (err) throw err;
         console.log(q+'.csv saved.');
       });
    });	
		
  }
  else {
	  console.log(err);
  }
  
});
};

if (args['2'] === "query") {
  gmaps(args['3']);
}
else if (args['2'] === "parse") {
   const results = [];
   fs.createReadStream(args['3'])
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
	  index = 1
	  results.forEach(function (val, index, array) {
		    setTimeout(function() {
				gmaps(val.merchant_name+" "+val.city);
			}, 120000 * index);
			index = index + 1;
		})
  });
}
else {
   console.log("Usage : \n node index.js query 'query'\n node index.js parse 'file.csv'");
}	
