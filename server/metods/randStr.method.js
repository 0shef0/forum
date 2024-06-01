const bcrypt = require("bcryptjs");

var saltRounds = 8

class Random {
    RandStr = () => {
        var res = ''
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        var length = chars.length
        for (var i = 0; i < 100; i++) {
            res = chars.charAt(Math.floor(Math.random() * length))
        }
        const salt = bcrypt.genSaltSync(saltRounds)
        return bcrypt.hashSync(res, salt);
    }
}

module.exports = new Random()