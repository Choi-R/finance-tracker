const { error, errorBug } = require('../helpers/response')

exports.validateInput = async (req, res, next) => {
    let { day, month, year, total } = req.body
    try {
        if (day) {
            if ( (typeof day == 'string' && day.length > 0) || typeof day == 'number') {
                if (isNaN(day)) throw 'The value of day should be numerical'
                else day = parseInt(day)
                if (day > 31) throw `The inputted value of day is nonexistent`
            }
            else 'The value of day should be numerical'
        }
        else req.body.day = new Date().getUTCDate()
        if (month) {
            if ((typeof month == 'string'  && month.length > 0) || typeof month == 'number') {
                if (isNaN(month)) throw 'The value of month should be numerical'
                else month = parseInt(month)
                if (month > 12) throw `The inputted value of month is nonexistent`
            }
            else 'The value of month should be numerical'
        }
        else req.body.month = new Date().getUTCMonth() + 1
        if (year) {
            if ( (typeof year == 'string'  && year.length > 0) || typeof year == 'number') {
                if (isNaN(year)) throw 'The value of year should be numerical'
                else year = parseInt(year)
                if (year > new Date().getFullYear()) throw `The inputted value of year is nonexistent`
            }
            else 'The value of year should be numerical'
        }
        else req.body.year = new Date().getFullYear()
        if (total) {
            if (typeof total == 'string' || typeof total == 'number') {
                if (isNaN(total)) throw 'The value of total should be numerical'
                else total = parseInt(total)
            }
            else 'The value of total should be numerical'
        }
        next()
    }
    catch(err) {
        if (err.includes('numerical') || err.includes('nonexistent')) return error(res, 400, err)
        else { return errorBug(res, err, 'from tracker middleware: validateInput') }
    }
}