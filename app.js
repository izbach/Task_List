var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy   = require("passport-local"),
    db = require("./queries1"),
    path = require('path'),
    Manager = require("./models/manager")
    pool = require("./dbsetup"),
    methodOverride = require("method-override"),
    cron = require("node-cron"),
    bodyParser = require("body-parser")
    async = require("async")





//=============================================================
// CONFIGURATION
//=============================================================

mongoose.connect("mongodb://localhost:27017/YMCAstats", {useCreateIndex:true, useNewUrlParser: true, useUnifiedTopology:false})
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, '/public')));
var adminRoutes = require("./routes/admin");

//=============================================================
// AUTHORIZATION SETUP
//=============================================================
app.use(require("express-session")({
    secret: "Toby is the best dog ever!",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Manager.authenticate()));

passport.serializeUser(Manager.serializeUser());
passport.deserializeUser(Manager.deserializeUser());


//=============================================================
// ROUTES
//=============================================================

app.get("/", (req, res)=>{
    console.log(req.session)
    res.render("landing")
})
app.get("/tester", (req, res) =>{
    pool.query('SELECT * FROM ecy.pools', (err, allPools) => {
        if(err){
            throw err
        }
        res.render("tester", {pools: allPools.rows})
    })
    
})
app.get('/tasks', db.getTasks)
app.get('/walkthroughs/done', db.getWalkThroughsDone)
app.get('/headcounts/done', db.getHeadcountsDone)
app.get('/operating-hours', db.getOpeningClosingTimes)
app.post('/watertests', db.createWaterTest)
app.post('/headcounts', db.createHeadCount)
app.post('/walkthroughs', db.createWalkthroughEntry)
app.post('/tasks', db.createTask)

app.get('/employees', db.getEmployees)
app.get('/tasks/done', (req, res) => {
    pool.query('SELECT * FROM tasks', (err, results) => {
        if(err){
            throw err
        }
        res.send(results.rows)
    })
})
app.get('/tasks/:id', db.getTaskById)
app.get("/stats/:branch", function(req, res){
    var branch = req.params.branch;
    var tasks;
    var pools;
    var changerooms;
    async.series([
        function(callback){
            pool.query('SELECT * FROM tasks_list', (err, allTasks) => {
                if(err){
                    throw err
                }
                tasks = allTasks.rows
                callback(null, allTasks)
            })
        },
        function(callback){
            pool.query('SELECT * FROM '+ branch +'.pools', (err, allPools) => {
                if(err){
                    throw err
                }
                pools = allPools.rows
                callback(null, allPools)
            })
        },
        function(callback){
            pool.query('SELECT * FROM '+ branch +'.changerooms', (err, allChangerooms) => {
                if(err){
                    throw err
                }
                changerooms = allChangerooms.rows
                callback(null, allChangerooms)
            })
        }
    ],
    function(err){
        if(err){
            throw err
        }
        res.render("taskSheet", {tasks: tasks, branch: branch, pools: pools, changerooms: changerooms})
    })
    
})







app.listen("3000", function(){
    console.log("server is running")
})
// INSERT INTO mycopy
// SELECT * FROM mytable;
cron.schedule("30 1 * * *", function(){
    pool.query("INSERT INTO tasks_longterm SELECT * FROM tasks");
    pool.query("DELETE FROM tasks")
})


//============================================
//AUTH ROUTES
//============================================


// show regiser form
// app.get("/register", (req, res) => {
//     res.render("register");
// })
// sign up logic
// app.post("/register", (req, res) => {
//     var newManager = new Manager({username: req.body.username, branch: req.body.branch});
//     Manager.register(newManager, req.body.password, (err, user) => {
//         if (err){
//             console.log(err)
//             return res.render("register")
//         }
//         passport.authenticate("local")(req, res, function(){
//             res.redirect("/admin")
//         })
//     })
// })

// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/admin",
        failureRedirect: "/login"
    }), (req, res) => {

})


app.use(adminRoutes)
// SELECT taskdate, task_weekday, task_name, full_name, branch
// FROM tasks_longterm
// JOIN employees
// ON tasks_longterm.employee_id = employees.employee_id
// JOIN tasks_list
// ON tasks_longterm.task_id = tasks_list.id;

// SELECT full_name, COUNT(*)
// FROM tasks_longterm
// JOIN employees
// ON tasks_longterm.employee_id = employees.employee_id          
// GROUP BY full_name;

// SELECT full_name, COUNT(*)
// FROM tasks_longterm
// JOIN employees
// ON tasks_longterm.employee_id = employees.employee_id
// WHERE taskdate = 'Dec 11 2019'::timestamp
// GROUP BY full_name;
