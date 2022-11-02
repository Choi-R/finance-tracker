const pool = require('../db/config')
const { success, error, errorBug } = require('../helpers/response')

exports.insertData = async (req, res) => {
    const { day, month, year, total } = req.body
    const { id } = req.user
    try {
        let { rows } = await pool.query(`INSERT INTO public.trackers (day, month, year, total, created_by, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING RETURNING *`, [day, month, year, total, id, new Date()])

        if (rows[0]) {
            let token = jwt.sign(rows[0].id, process.env.SECRET_KEY)
            return success(res, 201, token)
        }
        else { throw "This date is already exist" }
    }
    catch (err) {
        if (typeof err == 'string' && err.includes('already exist')) { return error(res, 400, err) }
        else { return errorBug(res, err, `From insert tracker`) }
    }
}

exports.listData = async (req, res) => {
    const { id } = req.user
    try {
        let { rows } = await pool.query(`SELECT id, month, year, SUM(total) AS total FROM public.trackers
        WHERE created_by=$1 
        GROUP BY month
        ORDER BY year DESC, month DESC`, [id])
        return success(res, 200, rows)
    }
    catch(err) {
        return errorBug(res, err, `From list tracker`)
    }
}

exports.editData = async (req, res) => {
    const { day, month, year, total } = req.body
    const { trackerId } = req.params
    try {

    }
    catch(err) {
        return errorBug(res, err, `From edit tracker`)
    }
}

exports.deleteData = async (req, res) => {
    const { trackerId } = req.params
    try {}
    catch(err) {
        return errorBug(res, err, `From delete tracker`)
    }
}