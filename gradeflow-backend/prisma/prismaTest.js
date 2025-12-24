require("dotenv").config();
const prisma = require("./client");

async function test() {
  const users = await prisma.users.findMany();
  console.log(users);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());