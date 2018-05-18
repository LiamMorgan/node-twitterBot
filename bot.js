
var twit = require("twit");
var config = require("./config.js");
var fs = require('fs');
var scraperjs = require('scraperjs');
var Twitter = new twit(config);
//Above are npm packages or configuration files
var botId = "995802496768634885";

function postQuote() {
	console.log("===========Quote Bot===========");
	var x = [];
	var quote;
	scraperjs.StaticScraper.create('http://www.quotationspage.com/qotd.html/')
    .scrape(function($) {
		x[0] = $(".quote a").map(function() {
            return $(this).text();
		}).get();
		x[1] = $(".author a").map(function() {
            return $(this).text();
		}).get();
		quote = x[0][0] + " - " + x[1][4] + " #quote #quotes #qotd #dailyquote #dailyquotes";
        return quote
    })
    .then(function(quote) {
		msg = {
			status: quote
		}
		Twitter.post("statuses/update", msg, function(err, data, response) {
		});
		fs.writeFile("quoteLog.txt", quote, 
		function (err) {
			if (err) throw err;
		});
	})
	setTimeout(postQuote,3600000*24);
}

function favoriteBot() {
	console.log("===========Favorite Bot===========");
	var tweetID;
	var tweetText;
	var ids;
	Twitter.get("friends/ids", {id: botId}, function(err, data, response) {
		if(err) {
				console.log("Error - " + err);
		} else {
			ids = data.ids;
			for(i=0;i<ids.length;i++) {
				msg = {
					user_id: ids[i],
					count: 5
				}
				Twitter.get("statuses/user_timeline", msg, function(err, data, response) {
					if(err) {
						console.log("Like method GET error " + err);
					} else {
						for(j=0;j<data.length;j++) {
							tweetID = data[j].id_str;
							tweetText = data[j].text;
							if(tweetText.includes("RT")) {
								continue;
							}
							console.log("ID:\t%s \nText:\t%s" , tweetID, tweetText);		
							Twitter.post('favorites/create', {id: tweetID}, function(err, response){
							});	
						}
					}
				});
			}
		}
	});
	setTimeout(favoriteBot,3600000/3);
}

postQuote();
favoriteBot();
