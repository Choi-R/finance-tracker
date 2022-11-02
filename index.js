require('dotenv').config()
require('./app/db/config')
const express = require('express')
const app = express()

app.use(express.json())

const swagger = require('swagger-ui-express')
const documentation = require('./app/swagger.json')
app.use('/documentation', swagger.serve, swagger.setup(documentation))

const router = require('./app/routes/index')
app.use('/', router)

let server = app.listen(5555, () => { console.log('listening to port 5555') })
server.setTimeout(6*1000)
module.exports = server