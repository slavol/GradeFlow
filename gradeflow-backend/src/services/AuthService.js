const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const UserRepository = require("../repositories/UserRepository")

class AuthService{

    async register({email, password}){
        const existing = await UserRepository.findByEmail(email);
        if (existing) throw new Error("User already exists");

        const hashed = await bcrypt.hash(password, 10);
        return await UserRepository.create(email, hashed);
    }

    async login({email, password}){
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new Error("Invalid credentials");

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error("Invalid credentials");

        return jwt.sign({id: user.id}, process.env.JWT_SECRET,{
            expiresIn: "7d"
        });
    }

}

module.exports = new AuthService ();