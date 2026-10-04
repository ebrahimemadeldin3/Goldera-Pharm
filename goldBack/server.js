import express from "express";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import errorMiddleware from "./middlewares/error.middleware.js";
import mountRoutes from "./routes/index.js";
import { PORT, CLIENT_URL, NODE_ENV } from "./config/index.js";
import { ApiError } from "./utils/apiError.js";

const app = express();

// Configure CORS with specific options
const corsOptions = {
  origin: CLIENT_URL,
  credentials: true, // Allow cookies and HTTP authentication
};

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${NODE_ENV}`);
}

//middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(
  ["/api/doctors/bulk-import", "/api/pharmacies/bulk-import"],
  express.json({ limit: "2mb" }),
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));

// Apply one response boundary to every user relation, including nested team data.
app.use((req, res, next) => {
  const json = res.json.bind(res);
  res.json = (body) =>
    json(
      JSON.parse(
        JSON.stringify(body, (key, value) =>
          key === "password" || key === "newPassword" ? undefined : value,
        ),
      ),
    );
  next();
});

// Mount Routes
mountRoutes(app);

app.use((req, res, next) => {
  next(new ApiError(`Route ${req.originalUrl} not found`, 404));
});

// Global Error Handling Inside Express
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handling Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.name, err.message);
  process.exit(1);
});

// Handling Rejections Outside Express
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection at:", err.name, err.message);
  server.close(() => {
    console.error("Shutting down...");
    process.exit(1);
  });
});
