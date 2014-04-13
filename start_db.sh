#!/bin/sh

MONGOD=$1
PORT=$2
$MONGOD --port $PORT --dbpath ./mongodb.data --directoryperdb