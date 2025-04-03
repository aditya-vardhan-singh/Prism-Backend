import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import prisma from "../lib/db";
import { parse } from "dotenv";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be 8 characters long" })
    .max(12, { message: "Password can only be 12 characters long" }),
});

const updateSchema = z.object({
  username: z.string({ message: "Name is required" }).optional(),
  university: z.string().max(72).optional(),
  course: z.string({ message: "Course is required" }).optional(),
  department: z
    .enum(
      [
        "Computer Science and Engineering",
        "Electronics Communication Engineering",
        "Information Technology",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
      ],
      {
        message: "Invalid department",
      }
    )
    .optional(),
  year: z
    .enum(["1st", "2nd", "3rd", "4th"], {
      message: "Invalid academic year",
    })
    .optional(),
  email: z.string().email({ message: "Invalid email" }).optional(),
  contactNumber: z
    .string()
    .max(10, { message: "Invalid contact number" })
    .optional(),
  gender: z
    .enum(["Male", "Female", "Other", ""], {
      message: "Invalid gender details",
    })
    .optional(),
});

const registrationSchema = z.object({
  username: z.string({ message: "Name is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be 8 characters long" })
    .max(12, { message: "Password can only be 12 characters long" }),
  university: z.string().max(72),
  course: z.string({ message: "Course is required" }),
  department: z.enum(
    [
      "Computer Science and Engineering",
      "Electronics Communication Engineering",
      "Information Technology",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
    ],
    {
      message: "Invalid department",
    }
  ),
  year: z.enum(["1st", "2nd", "3rd", "4th"], {
    message: "Invalid academic year",
  }),
  email: z.string().email({ message: "Invalid email" }),
  contactNumber: z.string().max(10, { message: "Invalid contact number" }),
  gender: z
    .enum(["Male", "Female", "Other", ""], {
      message: "Invalid gender details",
    })
    .optional(),
});

const memberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
});

const teamSchema = z.object({
  type: z.literal("MULTI"),
  teamname: z.string({ message: "Team name is required" }),
  members: z
    .array(memberSchema)
    .max(3, "Team can have maximum 4 members (including leader)"),
});

export const teamCreationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = teamSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res
      .status(400)
      .json({ error: "Invalid details", details: parsedBody.error.errors });
    return;
  }
  req.body = parsedBody.data;
  next();
};

export const updateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = updateSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res
      .status(400)
      .json({ error: "Invalid details", details: parsedBody.error.errors });
    return;
  }
  req.body = parsedBody.data;
  next();
};

export const registrationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = registrationSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res
      .status(400)
      .json({ error: "Invalid details", details: parsedBody.error.errors });
    return;
  }
  req.body = parsedBody.data;
  next();
};

export const loginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = loginSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res
      .status(400)
      .json({ error: "Invalid details", details: parsedBody.error.errors });
    return;
  }
  req.body = parsedBody.data;
  next();
};

export const existingUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, contactNumber } = req.body;

    const user = await prisma.participant.findFirst({
      where: {
        OR: [{ email }, { contactNumber }],
      },
    });

    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking user: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const teamRegisterSchema = z.object({
  teamname: z.string({ message: "team name is required" }),
  eventId: z.number({ message: "event id is required" }),
  members: z.array(memberSchema),
});

export const teamRegisterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = teamRegisterSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res
      .status(400)
      .json({ error: "Invalid details", details: parsedBody.error.errors });
    return;
  }
  req.body = parsedBody.data;
  next();
};

const registerTeamEventSchema = z.object({
  teamname: z.string({ message: "team name is required" }),
  members: z.array(memberSchema),
});

export const registerTeamEventValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = registerTeamEventSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res
      .status(400)
      .json({ error: "Invalid details", details: parsedBody.error.errors });
    return;
  }
  req.body = parsedBody.data;
  next();
};
