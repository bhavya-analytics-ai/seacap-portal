import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
import applicationRoutes from "./routes/applicationRoutes.js";



const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "seacap-backend",
    port: 5001
  });
});

app.use("/api", applicationRoutes);

const PORT = Number(process.env.PORT || 5001);

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
})();