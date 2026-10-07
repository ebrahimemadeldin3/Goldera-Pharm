import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import { generateAccessToken } from "../utils/jwtToken.js";
import { ApiError } from "../utils/apiError.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

// Login
const login = async (req, res, next) => {
  const email = normalizeEmail(req.body?.email);
  const { password } = req.body || {};

  if (!email || !password) {
    return next(new ApiError("Email and password are required", 400));
  }

  // find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid email or password", 401));
  }

  if (user.isActive === false) {
    return next(new ApiError("Account is deactivated", 403));
  }

  const { password: _password, ...safeUser } = user;

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
    data: safeUser,
    token: accessToken,
  });
};

// Signup
const signup = async (req, res, next) => {
  const name = req.body?.name?.trim();
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  const phone = req.body?.phone;
  const role = req.body?.role;
  const dateOfBirth = req.body?.dateOfBirth;

  if (!name || !email || !password || !dateOfBirth) {
    return next(
      new ApiError("Name, email, password and date of birth are required", 400),
    );
  }

  // Prevent client from minting privileged roles
  if (role && role !== "MEDICAL_REP") {
    return next(
      new ApiError("Registration for privileged roles is not permitted", 403),
    );
  }
  const assignedRole = "MEDICAL_REP";

  // find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (user) {
    return next(new ApiError(`User with email: ${email} already exists`, 400));
  }

  const parsedDateOfBirth = new Date(dateOfBirth);
  if (Number.isNaN(parsedDateOfBirth.getTime())) {
    return next(new ApiError("Invalid date of birth", 400));
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
      role: assignedRole,
      dateOfBirth: parsedDateOfBirth,
      isActive: true,
    },
  });

  const { password: _password, ...safeUser } = newUser;

  // generate JWT
  const accessToken = generateAccessToken(newUser.id, newUser.role);

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: safeUser,
    token: accessToken,
  });
};

export { login, signup };
