import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import { generateAccessToken } from "../utils/jwtToken.js";
import { ApiError } from "../utils/apiError.js";

// Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  // find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid email or password", 404));
  }

  // generate JWT
  const accessToken = generateAccessToken(user.id, user.role);

  // update lastLogin
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date().toISOString() },
  });

  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: user,
    token: accessToken,
  });
};

// Signup
const signup = async (req, res, next) => {
  const { name, email, password, phone, role, dateOfBirth } = req.body;

  // find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (user) {
    return next(new ApiError(`User with email: ${email} already exists`, 400));
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      dateOfBirth: new Date(dateOfBirth),
    },
  });

  // generate JWT
  const accessToken = generateAccessToken(newUser.id, newUser.role);

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: newUser,
    token: accessToken,
  });
};

export { login, signup };
