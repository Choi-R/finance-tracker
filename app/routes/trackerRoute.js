const express = require('express')
const route = express.Router()
const trackerC = require('../controllers/trackerController')
const { authenticate } = require('../middlewares/authenticate')
const trackerM = require('../middlewares/trackerMiddleware')

route.post('/tracker', trackerM.validateInput, authenticate, trackerC.insertData)
route.get('/tracker', authenticate, trackerC.listData)
// route.put('/tracker', trackerM.validateInput, authenticate, trackerC.editData)

module.exports = route