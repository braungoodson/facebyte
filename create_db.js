db = connect('localhost:20000/facebyte');
db.users.ensureIndex({"username":1},{unique:true,dropDups:true});
db.users.insert({username:"administrator",password:"administrator"});