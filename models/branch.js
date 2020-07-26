var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var BranchSchema = new mongoose.Schema({
    branch: String,
    password: String
})

Branch.plugin(passportLocalMongoose);

module.exports = mongoose.model("Branch", BranchSchema);