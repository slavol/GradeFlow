const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");

class AuthController {
  async register(req, res) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role)
        return res.status(400).json({ message: "Missing fields" });

      const hashed = await bcrypt.hash(password, 10);

      const user = await UserRepository.create(email, hashed, role);

      res.json({ message: "User created", user });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.findByEmail(email);

      if (!user)
        return res.status(401).json({ message: "User not found" });

      const valid = await bcrypt.compare(password, user.password);

      if (!valid)
        return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ 
        token,
        role: user.role
       });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new AuthController();