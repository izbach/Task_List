var express = require("express");
var router = express.Router();
var db = require("./admin");
var pool = require("../dbsetup")
var async = require("async")
var cron = require("node-cron")
var cookieParser = require('cookie-parser')
var session = require("express-session")


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

function DefaultDateSetup(req, res, next){
    if(req.query.dateFrom === undefined){
        var d = new Date(req.session['dateCookie'])
        var ms_per_minute = 60000;
        d.setTime( d.getTime() + d.getTimezoneOffset()*ms_per_minute );
        res.locals.defaultMonth = d.getMonth() + 1
        res.locals.defaultDay = d.getDate()
        res.locals.defaultYear = d.getFullYear()
        
        if((d.getMonth()+1).toString().length < 2){
            res.locals.defaultMonth = "0" + (d.getMonth() + 1)
        }
        if(d.getDate().toString().length < 2){
            res.locals.defaultDay = "0" + d.getDate()
        }
        if(req.session["dateToCookie"] === ""){
            res.locals.dayTo = ""
            res.locals.yearTo = ""
            res.locals.monthTo = ""
            var toRange = ""
        } 
        else{
            var dt = new Date(req.session["dateToCookie"])
            dt.setTime( dt.getTime() + dt.getTimezoneOffset()*ms_per_minute );
            res.locals.monthTo = dt.getMonth() + 1
            res.locals.dayTo = dt.getDate()
            res.locals.yearTo = dt.getFullYear()
            if((dt.getMonth()+1).toString().length < 2){
                res.locals.monthTo = "0" + (dt.getMonth() + 1)
            }
            if(dt.getDate().toString().length < 2){
                res.locals.dayTo = "0" + dt.getDate()
            }
            toRange = " AND date <= '" + dt.toLocaleDateString() + "'::timestamp"
        }
        
        // d = DefaultDateSetup(req.session['dateCookie'])
        // req.session["dateCookie"] = req.query.dateFrom
        res.locals.dateLookup = " WHERE date >= '" + d.toLocaleDateString() + "'::timestamp" + toRange
    } else if(req.query.dateFrom !== undefined && req.query.dateFrom !== ""){
        var d = new Date(req.query.dateFrom)
        
        var ms_per_minute = 60000;
        d.setTime( d.getTime() + d.getTimezoneOffset()*ms_per_minute );
        
        res.locals.defaultMonth = d.getMonth() + 1
        res.locals.defaultDay = d.getDate()
        res.locals.defaultYear = d.getFullYear()
        if((d.getMonth()+1).toString().length < 2){
            res.locals.defaultMonth = "0" + (d.getMonth() + 1)
        }
        if(d.getDate().toString().length < 2){
            res.locals.defaultDay = "0" + d.getDate()
        }
        if(req.query.dateTo === ""){
            res.locals.monthTo = ""
            res.locals.dayTo = ""
            res.locals.yearTo = ""
            var toRange = ""
            
        } else {
            var dt = new Date(req.query.dateTo)
            dt.setTime( dt.getTime() + dt.getTimezoneOffset()*ms_per_minute );
            res.locals.monthTo = dt.getMonth() + 1
            res.locals.dayTo = dt.getDate()
            res.locals.yearTo = dt.getFullYear()
            if((dt.getMonth()+1).toString().length < 2){
                res.locals.monthTo = "0" + (dt.getMonth() + 1)
            }
            if(dt.getDate().toString().length < 2){
                res.locals.dayTo = "0" + dt.getDate()
            }
            toRange = " AND date <= '" + dt.toLocaleDateString() + "'::timestamp"
            req.session["dateToCookie"] = req.query.dateTo
        }
        req.session["dateCookie"] = req.query.dateFrom
        res.locals.dateLookup = " WHERE date >= '" + d.toLocaleDateString() + "'::timestamp" + toRange
    } else if(req.query.dateFrom === "") {
        res.locals.defaultMonth = ""
        res.locals.defaultDay = ""
        res.locals.defaultYear = ""
            
        if(req.query.dateTo === ""){
            
            res.locals.monthTo = ""
            res.locals.dayTo = ""
            res.locals.yearTo = ""
            
            res.locals.dateLookup = ""
        } else {
            
            var dt = new Date(req.query.dateTo)
            var ms_per_minute = 60000;
            dt.setTime( dt.getTime() + dt.getTimezoneOffset()*ms_per_minute );
            res.locals.monthTo = dt.getMonth() + 1
            res.locals.dayTo = dt.getDate()
            res.locals.yearTo = dt.getFullYear()
            if((dt.getMonth()+1).toString().length < 2){
                res.locals.monthTo = "0" + (dt.getMonth() + 1)
            }
            if(dt.getDate().toString().length < 2){
                res.locals.dayTo = "0" + dt.getDate()
            }
            console.log(dt)
            res.locals.dateLookup = "WHERE date <= '" + dt.toLocaleDateString() + "'::timestamp"
            req.session["dateToCookie"] = req.query.dateTo
        }
    }
    next()
}
router.use(function (req, res, next) {
    // check if client sent cookie
    var dateFromCookie = req.session['dateCookie'];
    var dateToCookie = req.session['dateToCookie']
    if (dateFromCookie === undefined || dateToCookie === undefined)
    {
        var d = new Date()
        var ms_per_minute = 60000;
        d.setTime( d.getTime() + d.getTimezoneOffset()*ms_per_minute );
        req.session["dateCookie"] = d;
        req.session["dateToCookie"] = ""
    }
    else
    {
    } 
    next(); // <-- important!
  });

router.use(isLoggedIn, function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.dateFromCookie = req.session["dateCookie"]
    
    next()
})

router.get("/admin/tasks", (req, res) => {
    pool.query('SELECT * FROM tasks_list', (err, results) => {
        if(err){
            throw err
        }
        res.render("tasks", {tasks: results.rows})
    })
})

router.put('/admin/tasks/:id',(request, response) => {
    const id = parseInt(request.params.id)
    const { task_name, task_desc } = request.body
    pool.query(
        'UPDATE tasks_list SET task_name = $1, task_desc = $2 WHERE id = $3',
        [task_name, task_desc, id],
        (error, results) => {
        if (error) {
            throw error
        }
        response.redirect("/admin/tasks")
        }
    )
})
router.get("/admin", (req, res) =>{
    res.redirect("/admin/tasks")
})
router.delete('/admin/tasks/:id',(request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM tasks_list WHERE id = $1', [id], (error, results) => {
        if (error) {
        throw error
        }
        response.redirect("/admin/tasks")
    })
})
router.post('/admin/tasks', (request, response) => {
    const { task_name, task_time, task_desc, branch } = request.body

    pool.query('INSERT INTO tasks_list (task_name, task_time, task_desc, branch) VALUES ($1, $2, $3, $4)', [task_name, task_time, task_desc, branch], (error, results) => {
        if (error) {
        throw error
        }
        response.redirect("/admin/tasks")
    })
})
router.get("/admin/tasks-complete-index", DefaultDateSetup,(req, res) =>{
    console.log(res.locals.dateLookup)
    pool.query("INSERT INTO tasks_longterm SELECT * FROM tasks");
    pool.query("SELECT date, task_weekday, task_name, full_name, branch FROM tasks_longterm JOIN employees ON tasks_longterm.employee_id = employees.employee_id JOIN tasks_list ON tasks_longterm.task_id = tasks_list.id " + res.locals.dateLookup + " ORDER BY date DESC;", function(err, results){
        if(err){
            throw err
        }
        res.render("tasksIndex", {completedTasks: results.rows, DateFrom: req.query.dateFrom})
    })
})
router.get("/admin/watertest-index", DefaultDateSetup,(req, res) =>{
    pool.query("SELECT date, watertestday, pool, full_name, fac, cc, tc, ph, temp, dmnotified, closure FROM ecy.watertests JOIN employees ON ecy.watertests.employee_id = employees.employee_id " + res.locals.dateLookup + " ORDER BY date DESC;", function(err, results){
        if(err){
            throw err
        }
        res.render("waterTestIndex", {waterTests: results.rows, DateFrom: req.query.dateFrom})
    })
})
router.get("/admin/employees", (req, res) => {
    
    pool.query("INSERT INTO tasks_longterm SELECT * FROM tasks");
    pool.query("SELECT * FROM employees", function(err, results){
        if(err){
            throw err
        }
        res.render("employees", {employees: results.rows})
    })
})
router.get("/admin/employee-counts", DefaultDateSetup, (req, res) => {
    pool.query("INSERT INTO tasks_longterm SELECT * FROM tasks");
    console.log(res.locals.dateLookup)
    pool.query("WITH t AS(SELECT full_name, COUNT(tasks_longterm.employee_id) AS tasks FROM tasks_longterm RIGHT JOIN employees ON tasks_longterm.employee_id = employees.employee_id GROUP BY full_name), w AS(SELECT full_name, COUNT(ecy.watertests.employee_id) AS watertests FROM ecy.watertests RIGHT JOIN employees ON ecy.watertests.employee_id = employees.employee_id GROUP BY full_name) SELECT t.full_name, tasks, watertests FROM t JOIN w ON t.full_name = w.full_name;", function(err, results){
        if(err){
            throw err
        }
        res.render("employeeCounts", {allCounts: results.rows, DateFrom: req.query.dateFrom})
    })
        
    // pool.query(" SELECT full_name, COUNT(*) FROM tasks_longterm JOIN employees ON tasks_longterm.employee_id = employees.employee_id "+ res.locals.dateLookup + " GROUP BY full_name ORDER BY COUNT DESC;", function(err, results){
    //     if(err){
    //         throw err
    //     }
    //     res.render("employeeCounts", {results: results.rows, DateFrom: req.query.dateFrom})
    // })
})
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/")
})

module.exports = router;