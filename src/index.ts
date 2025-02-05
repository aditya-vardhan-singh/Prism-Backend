import express, { NextFunction, Request, Response } from "express";
import cors from "cors";  // ✅ Import CORS
import { registrationMiddleware } from "./zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

// ✅ Enable CORS
app.use(
  cors({
    origin: "https://your-frontend-domain.com", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies/authentication if needed
  })
);

app.use(express.json());

// MIDDLEWARE
const existingUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const existingUser = await prisma.participant.findFirst({
      where: {
        OR: [{ email: body.email }, { contactNumber: body.contactNumber }],
      },
    });
    if (existingUser?.email) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }
    if (existingUser?.contactNumber) {
      res.status(400).json({ message: "User with this contact number already exists" });
      return;
    }
    next();
  } catch (error) {
    console.error("Error checking existing user: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ROUTES
app.post("/registration/solo", existingUser, registrationMiddleware, async (req, res) => {
  try {
    const body = req.body;
    await prisma.participant.create({ data: body });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error creating user: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/registration/team", existingUser, registrationMiddleware, async (req, res) => {
  try {
    const body = req.body;
    await prisma.participant.create({
      data: {
        name: body.name,
        university: body.university,
        department: body.department,
        year: body.year,
        email: body.email,
        contactNumber: body.contactNumber,
        gender: body.gender,
        type: body.type,
        members: {
          create: body.members,
        },
      },
    });
    res.status(201).json({ message: "Team registered successfully" });
  } catch (error) {
    console.error("Error creating team: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// START SERVER
app.listen(8888, () => {
  console.log("Server up and running on port 8888");
});
