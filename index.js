console.log('troll');

// CRYPTOGRAPHY //
var cryptography = require("crypto");

// MONGODB //
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var database = null;

mongoClient.connect('mongodb://localhost:20000/troll',mongodbClientConnect_handler);

function mongodbClientConnect_handler (error,_database){
	if (error) {
		throw error;
	} else {
		database = _database;
	}
}

// EXPRESS //
var express = require('express.io');
var http = express();

http.http();
http.listen(process.env.PORT||30000);

http.get('/users',httpGet_users);
http.post('/users/:username/:password',httpPost_usersCreate);
http.post('/users/tokens/:username/:password',httpPost_usersTokensCreate);
http.post('/users/photos/:troll/:token',httpPost_usersPhotos);

// CLASSES //
function httpGet_users (request,response) {
	if (database) {
		var users = database.collection('users');
		users.find({},{password:0,token:0,_id:0}).toArray(function(e,r){
			var json = null;
			if (e) {
				json = JSON.stringify(e);
			}
			json = JSON.stringify(r);
			response.send(json);
		});
	}
}

function httpPost_usersCreate (request,response) {
	if (database) {
		var users = database.collection('users');
		var user = {
			username: request.params.username,
			password: request.params.password
		};
		users.insert(user,function usersInsert_callback (error,objects) {
			if (error) {
				console.warn(error.message);
				response.send('{"error":"username already exists."}');
			} else {
				var token = new Token()();
				users.update(
					{username:user.username},
					{$set:{token:token}},
					function usersUpdate_tokenCallback (error,objects) {
						console.log(objects);
						if (error) {
							console.warn(error.message);
							response.send('{"error":"not authorized"}');
						} else {
							response.send(JSON.stringify({token:token}));
						}
					}
				);
			}
		});
	}
}

function httpPost_usersTokensCreate (request,response) {
	if (database) {
		var users = database.collection('users');
		var user = {
			username: request.params.username,
			password: request.params.password
		};
		var token = new Token()();
		users.update(
			{username:user.username,password:user.password},
			{$set:{token:token}},
			function usersUpdate_tokenCallback (error,objects) {
				if (error) {
					console.warn(error.message);
					response.send('{"error":"not authorized"}');
				} else {
					if (!objects) {
						response.send('{"error":"not authorized"}');
					} else {
						response.send(JSON.stringify({token:token}));
					}
				}
			}
		);
	}
}

function httpPost_usersPhotos (request,response) {
	if (database) {
		var users = database.collection('users');
		var user = {
			token: request.params.token,
			troll: request.params.troll
		};
		users.update(
			{token:user.token},
			{$set:{troll:request.params.troll}},
			function usersUpdate_callback (error,objects) {
				if (error) {
					console.warn(error.message);
					response.send('{"error":"not authorized"}');
				}
				response.send(JSON.stringify(objects));
			}
		);
	}
}

function Token () {
	return function token () {
		return cryptography.createHash("md5").update("8h7d348cyrnc3rfr34not95thnoqvifjrknsvs8d4mnruk8938to597nv9hf5").digest("hex");
	}
}