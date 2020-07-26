var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var ManagerSchema = new mongoose.Schema({
    username: String,
    branch: String,
    password: String
})

ManagerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Manager", ManagerSchema);