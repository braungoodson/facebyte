#!/bin/sh

MONGO=$1

if [ ! -d "mongodb.data" ]; then
	mkdir mongodb.data
fi

if [ -d "mongodb.data" ]; then
	$MONGO --port 20000 ./create_db.js
fi