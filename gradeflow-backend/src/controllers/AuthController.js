const AuthService = require("../services/AuthService");

class AuthController {

    async register(req, res) {
        try {
            const user = await AuthService.register(req.body);
            return res.status(201).json(user);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    async login(req, res) {
        try {
            const token = await AuthService.login(req.body);
            return res.json({ token });
        } catch (err) {
            return res.status(401).json({ error: err.message })
        }
    }

}

module.exports = new AuthController();