const prisma = require("../../prisma/client");

class UserRepository {
  async create(email, password, role) {
    return prisma.users.create({
      data: {
        email,
        password,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  async findByEmail(email) {
    return prisma.users.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return prisma.users.findUnique({
      where: { id },
    });
  }
}

module.exports = new UserRepository();