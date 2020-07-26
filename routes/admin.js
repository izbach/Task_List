var express = require("express");
var router = express.Router();
var db = require("./admin");
var pool = require("../dbsetup");
var nodeExcel = require('excel-export');
var async = require("async");
var cron = require("node-cron");
var cookieParser = require('cookie-parser');
var session = require("express-session");


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
    console.log(req.user.branch)
    pool.query('SELECT * FROM '+ req.user.branch+'.tasks_list', (err, results) => {
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
        'UPDATE '+ request.user.branch+'.tasks_list SET task_name = $1, task_desc = $2 WHERE id = $3',
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

    pool.query('DELETE FROM '+ request.user.branch+'.tasks_list WHERE id = $1', [id], (error, results) => {
        if (error) {
        throw error
        }
        response.redirect("/admin/tasks")
    })
})
router.post('/admin/tasks', (request, response) => {
    const { task_name, task_time, task_desc } = request.body
    
    pool.query('INSERT INTO '+ request.user.branch+'.tasks_list (task_name, task_time, task_desc) VALUES ($1, $2, $3)', [task_name, task_time, task_desc], (error, results) => {
        if (error) {
        throw error
        }
        response.redirect("/admin/tasks")
    })
})
router.get("/admin/tasks-complete-index", DefaultDateSetup,(req, res) =>{
    console.log(res.locals.dateLookup)
    
    pool.query("INSERT INTO tasks_longterm SELECT * FROM tasks");
    pool.query("SELECT date, task_weekday, task_name, full_name, employees.branch FROM tasks_longterm JOIN employees ON tasks_longterm.employee_id = employees.employee_id JOIN "+ req.user.branch+".tasks_list ON tasks_longterm.task_id = "+ req.user.branch+".tasks_list.id " + res.locals.dateLookup + " ORDER BY date DESC;", function(err, results){
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
router.get("/admin/headcount-index", DefaultDateSetup,(req, res) =>{
    pool.query("SELECT date, day, time, pool, headcount, full_name FROM ecy.headcounts JOIN employees ON ecy.headcounts.employee_id = employees.employee_id " + res.locals.dateLookup + " ORDER BY date DESC, time DESC;", function(err, results){
        if(err){
            throw err
        }
        res.render("headcountIndex", {headcounts: results.rows, DateFrom: req.query.dateFrom})
    })
})
router.get("/admin/walkthrough-index", DefaultDateSetup,(req, res) =>{
    pool.query("SELECT date, day, time, changeroom, steamroom, full_name FROM ecy.walkthroughs JOIN employees ON ecy.walkthroughs.employee_id = employees.employee_id " + res.locals.dateLookup + " ORDER BY date DESC, time DESC;", function(err, results){
        if(err){
            throw err
        }
        res.render("walkthroughIndex", {walkthroughs: results.rows, DateFrom: req.query.dateFrom})
    })
})
router.get("/admin/facility-settings", (req, res) => {
    res.render("facilitySettings")
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
    // WE CAN MAKE THIS ONE TABLE BY GETTING THE EMPLOYEE LIST FIRST!!!

    pool.query("WITH t AS(SELECT full_name, COUNT(tasks_longterm.employee_id) AS tasks FROM tasks_longterm RIGHT JOIN employees ON tasks_longterm.employee_id = employees.employee_id "+ res.locals.dateLookup +" GROUP BY full_name), h AS(SELECT full_name, COUNT(ecy.headcounts.employee_id) AS headcounts FROM ecy.headcounts RIGHT JOIN employees ON ecy.headcounts.employee_id = employees.employee_id "+ res.locals.dateLookup +" GROUP BY full_name), wt AS(SELECT full_name, COUNT(ecy.walkthroughs.employee_id) AS walkthroughs FROM ecy.walkthroughs RIGHT JOIN employees ON ecy.walkthroughs.employee_id = employees.employee_id "+ res.locals.dateLookup +" GROUP BY full_name), w AS(SELECT full_name, COUNT(ecy.watertests.employee_id) AS watertests FROM ecy.watertests RIGHT JOIN employees ON ecy.watertests.employee_id = employees.employee_id "+ res.locals.dateLookup + " GROUP BY full_name) SELECT employees.full_name, tasks, watertests, headcounts, walkthroughs FROM employees FULL JOIN w ON employees.full_name = w.full_name FULL JOIN t ON employees.full_name = t.full_name FULL JOIN wt ON employees.full_name = wt.full_name FULL JOIN h ON employees.full_name = h.full_name;", function(err, results){
        if(err){
            throw err
        }
        res.render("employeeCountsAll", {allCounts: results.rows, DateFrom: req.query.dateFrom})
    })
    // async.series([
    //     function(callback){
    //         pool.query(" SELECT full_name, COUNT(*) AS tasks FROM tasks_longterm JOIN employees ON tasks_longterm.employee_id = employees.employee_id "+ res.locals.dateLookup + " GROUP BY full_name ORDER BY tasks DESC;", function(err, allTaskCounts){
    //             if(err){
    //                 throw err
    //             }
    //             console.log(allTaskCounts.rows)
    //             taskCounts = allTaskCounts.rows
    //             callback(null, allTaskCounts)
    //         })
    //     },
    //     function(callback){
    //         pool.query("SELECT full_name, COUNT(ecy.watertests.employee_id) AS watertests FROM ecy.watertests RIGHT JOIN employees ON ecy.watertests.employee_id = employees.employee_id "+ res.locals.dateLookup + " GROUP BY full_name ORDER BY watertests DESC;", function(err, allWaterTestCounts){
    //             if(err){
    //                 throw err
    //             }
    //             waterTestCounts = allWaterTestCounts.rows
    //             callback(null, allWaterTestCounts)
    //         })
    //     },
    //     function(callback){
            
    //         pool.query("SELECT full_name, COUNT(*) AS headcounts FROM ecy.headcounts RIGHT JOIN employees ON ecy.headcounts.employee_id = employees.employee_id "+ res.locals.dateLookup + " GROUP BY full_name ORDER BY headcounts DESC;", function(err, allHeadCounts){
    //             if(err){
    //                 throw err
    //             }
    //             headcounts = allHeadCounts.rows
    //             callback(null, allHeadCounts)
    //         })
            
    //     },
    //     function(callback){
    //         pool.query("SELECT full_name, COUNT(*) AS walkthroughs FROM ecy.walkthroughs RIGHT JOIN employees ON ecy.walkthroughs.employee_id = employees.employee_id "+ res.locals.dateLookup + " GROUP BY full_name ORDER BY walkthroughs DESC;", function(err, allWalkthroughs){
    //             if(err){
    //                 throw err
    //             }
    //             walkthroughs = allWalkthroughs.rows
    //             callback(null, allWalkthroughs)
    //         })
    //     }
    // ], 
    // function(err){
    //     if(err){
    //         throw err
    //     }
    //     res.render("employeeCounts", {taskCounts: taskCounts, walkthroughs: walkthroughs, headcounts: headcounts, waterTestCounts: waterTestCounts, DateFrom: req.query.dateFrom})
    // })       // pool.query(" SELECT full_name, COUNT(*) FROM tasks_longterm JOIN employees ON tasks_longterm.employee_id = employees.employee_id "+ res.locals.dateLookup + " GROUP BY full_name ORDER BY COUNT DESC;", function(err, results){
    //     if(err){
    //         throw err
    //     }
    //     res.render("employeeCounts", {results: results.rows, DateFrom: req.query.dateFrom})
    // })

    // pool.query("SELECT full_name, COUNT(ecy.watertests.employee_id) AS watertests FROM ecy.watertests RIGHT JOIN employees ON ecy.watertests.employee_id = employees.employee_id "+ res.locals.dateLookup + " GROUP BY full_name", function(err, results){
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