import express from "express";
import {
  submitApplication,
  getApplications,
  getApplicationById
} from "../controllers/applicationController.js";

const router = express.Router();


router.post("/application", submitApplication);

router.get("/applications", getApplications);

router.get("/application/:id", getApplicationById);

export default router;