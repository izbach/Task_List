const pool = require("./dbsetup");

const getTasks = (req, res) => {
    pool.query('SELECT * FROM tasks_list', (err, results) => {
        if(err){
            throw err
        }
        res.send(results.rows)
    })
}
const getUserById = (req, res) => {
    const id = parseInt(req.params.id)

    pool.query('SELECT * FROM users WHERE id = $1', [id], (err, results) =>{
        if(err){
            throw err
        }
        res.status(200).json(results.rows)
    })
}

const createTask = (request, response) => {
    const { task_name, task_time, task_desc } = request.body

    pool.query('INSERT INTO tasks_list (task_name, task_time, task_desc) VALUES ($1, $2, $3)', [task_name, task_time, task_desc], (error, results) => {
        if (error) {
        throw error
        }
        response.status(201).send(`User added with ID: ${results.insertId}`)
    })
}
const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User modified with ID: ${id}`)
        }
    )
}
const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).send(`User deleted with ID: ${id}`)
    })
}
module.exports = {
    getTasks,
    createTask
  }