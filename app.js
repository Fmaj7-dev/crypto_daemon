
function pad(n) {
	return n<10 ? '0'+n : n
}

const https = require('https');
var cron = require('node-cron');
require('dotenv').config();
console.log(process.env.API_KEY)

function getData()
{
  // get current time info for database insertion
  var date = new Date();
  var timestamp = date.getTime();

  var humanTime = date.getFullYear() + "/" +
                  pad((date.getMonth() + 1)) + "/" +
                  pad(date.getDate()) + " " +
                  pad(date.getHours()) + ":" + 
                  pad(date.getMinutes());


    https.get('https://min-api.cryptocompare.com/data/pricemulti?api_key=&fsyms=BTC,ETH,XRP,LTC,BCH,EOS,USDT,TRX&tsyms=EUR', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      var value = JSON.parse(data);
      console.log(data);

      // write result to mongo
      var MongoClient = require('mongodb').MongoClient,
          assert = require('assert');

      // Connection URL
      var url = 'mongodb://localhost:27017';

      // Use connect method to connect to the Server
      MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        assert.equal(null, err);
        console.log("Connected to localhost");

        // insert data
        var dbo = db.db("crypto");
        /**/
        for (var key in value) {
          if (value.hasOwnProperty(key)) {
            console.log(key + " -> " + value[key].EUR);

            var myobj = { _id: timestamp, time: humanTime, value: value[key].EUR };
            dbo.collection("cccagg_"+key).insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        });
          }
        }

        db.close();
      });

    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

//cron.schedule('0,15,30,45 * * * *', () => { getData() });
//getData();