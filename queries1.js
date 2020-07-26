const pool = require("./dbsetup");

const getTasks = (req, res) => {
    pool.query('SELECT * FROM tasks_list', (err, results) => {
        if(err){
            throw err
        }
        res.send(results.rows)
    })
}
const getEmployees = (req, res) => {
    pool.query('SELECT * FROM employees', (err, results) => {
        if(err){
            throw err
        }
        res.send(results.rows)
    })
}
const getTasksDone = (req, res) => {
    pool.query('SELECT * FROM tasks', (err, results) => {
        if(err){
            throw err
        }
        res.send(results.rows)
    })
}
const getWalkThroughsDone = (req, res) => {
    pool.query('SELECT * FROM ecy.walkthroughs WHERE date = CURRENT_DATE', (err, results) => {
        if(err){
            throw err
        }
        res.send(results.rows)
    })
}
const getHeadcountsDone = (req, res) => {
    pool.query('SELECT * FROM ecy.headcounts WHERE date = CURRENT_DATE', (err, results) => {
        if(err){
            throw err
        }
        res.send(results.rows)
    })
}
const getOpeningClosingTimes = (req, res) => {
    pool.query('SELECT * FROM ecy.openclosetimes', (err, results) => {
        if(err){
            throw err
        }
        res.send(results.rows)
    })
}
const getTaskById = (req, res) => {
    const id = parseInt(req.params.id)

    pool.query('SELECT * FROM tasks_list WHERE id = $1', [id], (err, results) =>{
        if(err){
            throw err
        }
        res.status(200).json(results.rows)
    })
}

const createTask = (request, response) => {
    const { task_weekday, employee_id, task_id } = request.body

    pool.query('INSERT INTO tasks (task_weekday, employee_id, task_id) VALUES ($1, $2, $3)', [task_weekday, employee_id, task_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`task added with ID: ${results.insertId}`)
    })
}
const createHeadCount = (request, response) => {
    const { day, time, headcount_pool, headcount, employee_id } = request.body

    pool.query('INSERT INTO ecy.headcounts (day, time, pool, headcount, employee_id) VALUES ($1, $2, $3, $4, $5)', [day, time, headcount_pool, headcount, employee_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`task added with ID: ${results.insertId}`)
    })
}
const createWalkthroughEntry = (request, response) => {
    const { day, time, changeroom, steamroom, employee_id } = request.body

    pool.query('INSERT INTO ecy.walkthroughs (day, time, changeroom, steamroom, employee_id) VALUES ($1, $2, $3, $4, $5)', [day, time, changeroom, steamroom, employee_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`walkthrough added`)
    })
}
const createWaterTest = (request, response) => {
    const { watertestday, watertesttime, employee_id, poolName, fac, cc, tc, ph, temp, closure, dmnotified } = request.body
    console.log(request.body)
    pool.query('INSERT INTO ecy.watertests (watertestday, watertesttime, employee_id, pool, fac, cc, tc, ph, temp, closure, dmnotified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [watertestday, watertesttime, employee_id, poolName, fac, cc, tc, ph, temp, closure, dmnotified], (error, results) => {
        if (error) {
            console.log("error")
        throw error
        }
        response.status(201).send(`Watertest added`)
    })
}
const updateTask = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
        if (error) {
            throw error
        }
        response.redirect('/admin/tasks')
        }
    )
}
const deleteTask = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM tasks_list WHERE id = $1', [id], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).send(`User deleted with ID: ${id}`)
    })
}
module.exports = {
    getOpeningClosingTimes,
    getTasks,
    createTask,
    getEmployees,
    getTasksDone,
    getTaskById,
    createWaterTest,
    createWalkthroughEntry,
    getWalkThroughsDone,
    createHeadCount,
    getHeadcountsDone
  }