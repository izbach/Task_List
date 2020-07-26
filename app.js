var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    db = require("./admin"),
    bodyParser = require("body-parser");

//=============================================================
//ROUTES
//=============================================================
// mongoose.connect("mongodb://localhost:27017/YMCAstats", {useNewUrlParser: true, useUnifiedTopology:true})
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs");
app.use(express.static('./public'));

app.get("/", function(req, res){
    res.render("home");
})

app.get("/admin", (req, res) => {
    res.render("admin")
})
app.get('/tasks', db.getTasks)
app.post('/tasks', db.createTask)

app.listen("3001", function(){
    console.log("server is running")
})
