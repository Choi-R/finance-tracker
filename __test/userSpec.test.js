const supertest = require('supertest')
const app = require('../index.js')
const request = supertest(app)
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const pool = require('../app/db/config')
let token
let newUser = {
    "name": "Choi",
    "email": "rahmadityac@gmail.com",
    "password": "12345678"
}

beforeAll(done => {
    pool.query(`DELETE FROM public.users`)
    done()
})

afterAll(done => {
    pool.query(`DELETE FROM public.users`)
    done()
})
describe('POST /user', function () {
    test('should register an user', function (done) {
        request.post(`/user`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(newUser))
            .then((res) => {
                token = jwt.sign({ _id: res.body.data }, process.env.SECRET_KEY)
                expect(res.statusCode).toBe(201)
                done()
            })
    })

    test('should not register an user because incorrect email format', function (done) {
        newUser.email = "sfsdfnkjes"
        request.post(`/user`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(newUser))
            .then((res) => {
                expect(res.statusCode).toBe(400)
                done()
            })
    })
})