const bcrypt = require('bcryptjs')
const { error, errorBug } = require('../helpers/response')
const { validateEmail } = require('../helpers/regex')

exports.validateInput = async (req, res, next) => {
    const { name, email, password } = req.body
    try {
        if (name) {
            if (typeof name != 'string' && name.length > 251) throw 'Name should be a string and no longer than 251 characters!'
        }
        if (email) {
            if (typeof email != 'string' && email.length > 251) throw 'Email should be a string and no longer than 251 characters!'
            req.body.email = validateEmail(email)
        }
        if (password) {
            if (typeof password != 'string' && password.length > 251) throw 'Password should be a string and no longer than 251 characters!'
            req.body.hashedPassword = bcrypt.hashSync(password, 10)
        }
        next()
    }
    catch (err) {
        if (err.includes('should be a string') || err.includes('email')) { return error(res, 400, err) }
        else { return errorBug(res, err, 'from user middleware: validateInput') }
    }
}

exports.mandatoryInput = async (req, res, next) => {
    const { name, email, password } = req.body
    try {
        if (!name || !email || !password) { throw false}
        next()
    }
    catch (err) {
        if (!name) { return error(res, 400, "name is missing") }
        if (!email) { return error(res, 400, "email is missing") }
        if (!password) { return error(res, 400, "password is missing") }

    }
}