const express = require('express')
const route = express.Router()
const userC = require('../controllers/userController')
const { authenticate } = require('../middlewares/authenticate')
const userM = require('../middlewares/userMiddleware')

route.post('/user', userM.validateInput, userC.register)
route.put('/login', userM.validateInput, userC.login)
route.get('/user', authenticate, userC.profile)

module.exports = route