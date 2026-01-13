import 'dotenv/config'
import "dotenv/config";
import express from 'express'
import { prisma } from "./lib/prisma"

const app = express();
app.use(express.json())

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)
