const router = require('express').Router()
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename)
const routes = {}

// === Membaca setiap file yang ada di folder ini, kecuali file ini ===
fs.readdirSync(__dirname).filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
}).forEach(file => {
    routes[file.split('.')[0]] = require(`./${file}`);
    router.use(routes[file.split('.')[0]])
})
// === Automatisasi app.use() router yang terbaca ===

module.exports = router;