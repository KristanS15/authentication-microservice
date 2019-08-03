const fs = require('fs');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');

const User = require('./User');

class Token {
    constructor(user) {
        this.access_token = this.accessToken(user);
        this.refresh_token = this.refreshToken();
        this.saveTokens(user);
    }

    accessToken(user) {
        const privateKEY = fs.readFileSync(process.env.PRIVATE_KEY_LOCATION, process.env.KEY_CHARSET || 'utf8');
        return jwt.sign(user, privateKEY, { expiresIn: 900, algorithm: process.env.KEY_ENCRYPTION || "RS256" });
    }

    refreshToken() {
        return randtoken.uid(256);
    }

    async saveTokens(user) {
        var expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7)
        expiryDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

        await User
            .query()
            .patch({
                refresh_token: this.refresh_token,
                refresh_token_expiry: expiryDate
            })
            .findById(user.id);
    }
}

module.exports = Token;
