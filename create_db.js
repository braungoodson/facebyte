db = connect('localhost:20000/troll');
db.users.ensureIndex({"username":1},{unique:true,dropDups:true});
db.users.insert({username:"administrator",password:"administrator"});