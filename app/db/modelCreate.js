const pool = require('./config')

const userQuery = `CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)`

const trackerQuery = `CREATE TABLE IF NOT EXISTS public.trackers (
    id serial PRIMARY KEY,
    day INT2,
    month INT2,
    year INT2,
    total INT8,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INT4 REFERENCES public.users(id) ON DELETE CASCADE
)`

const alterQuery = `ALTER TABLE IF EXISTS public.trackers
ADD UNIQUE(day, month, year, created_by)`

const execute = async () => {
    try { await pool.query(userQuery) }
    catch(err) { console.log(err, `From User Model`) }

    try { await pool.query(trackerQuery) }
    catch(err) { console.log(err, `From Tracker Model`) }

    try { await pool.query(alterQuery) }
    catch(err) { console.log(err, `From Alter`) }

    console.log(`Model created`)
}
execute().then(() => {return})