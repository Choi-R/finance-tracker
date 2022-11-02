const jwt = require('jsonwebtoken')
const { error, errorBug } = require('../helpers/response')

exports.authenticate = async (req, res, next) => {
    let { authorization } = req.headers
    try {
        if (authorization.includes('Bearer')) authorization = authorization.substring(7)
        let data = jwt.verify(authorization, process.env.SECRET_KEY)
        if (data) {
            req.user = { id: data }
            next()
        }
        else throw 'Invalid authorization token'
    }
    catch(err) {
        if (err == 'Invalid authorization token' || err.message == 'jwt malformed') return error(res, 400, 'Invalid authorization token')
        else if (err.message == 'jwt must be provided') return error(res, 400, 'Empty authorization token')
        else { return errorBug(res, err, 'from auth middleware') }
    }
}