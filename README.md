troll
========

The troll's HTTP port is 30000. The troll's database request if `localhost:20000` (i.e., a mongodb troll data instance running at `localhost:20000`).

Then to instaniate the services:

	$ ./start_db.sh $MONGO_BIN/mongod $DATA_PORT &
	$ ./create_db.sh $MONGO_BIN/mongo $DATA_PORT 
	$ npm install
	$ node index.js &

Sample instance:

	$ ./start_db.sh /local/troll/mongod 20000
		...
		^c
	$ ./create_db.sh /local/troll/mongo 20000
		...
	$ npm install
		...
	$ node index.js &
		...

Sample GET:

	$ curl localhost:30000/users
		...

Sample POST:

	$ curl -d "" localhost:30000/users/myUserName/myPassword
		...