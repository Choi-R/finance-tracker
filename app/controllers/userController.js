const pool = require('../db/config')
const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const { success, error, errorBug } = require('../helpers/response')

exports.register = async (req, res) => {
    const { name, email, hashedPassword } = req.body;
    try {
        let { rows } = await pool.query(`INSERT INTO public.users (name, email, password, created_at) 
        VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING *`, [name, email, hashedPassword, new Date()])

        if (rows[0]) {
            let token = jwt.sign(rows[0].id, process.env.SECRET_KEY)
            return success(res, 201, token)
        }
        else { throw "This email is already exist" }
    }
    catch (err) {
        if (typeof err == 'string' && err.includes('already exist')) { return error(res, 400, err) }
        else { return errorBug(res, err, `From register user`) }
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body
    try {
        let { rows } = await pool.query(`SELECT id, email, password FROM public.users WHERE email = $1`, [email])
        if (!rows[0]) throw `Incorrect email or password`
        let passwordCheck = bcrypt.compareSync(password, rows[0].password)

        if (passwordCheck) {
            let token = jwt.sign(rows[0].id, process.env.SECRET_KEY)
            return success(res, 200, token)
        }
        else throw `Incorrect email or password`
    }
    catch (err) {
        if (typeof err == 'string' && err.includes('Incorrect')) { return error(res, 400, err) }
        else { return errorBug(res, err, `From login`) }
    }
}

exports.profile = async (req, res) => {
    const { id } = req.user
    try {
        let { rows } = await pool.query(`SELECT name, email, created_at FROM public.users WHERE id=$1`, [id])
        return success(res, 200, rows[0])
    }
    catch (err) { return errorBug(res, err, `From profile user`) }
}