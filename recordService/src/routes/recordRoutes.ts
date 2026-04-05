import { Router } from "express";
import { useAuth } from "../middleware/useAuth";
import { isViewer, isAnalyst, isAdmin } from "../middleware/roleGuard";
import addRecord from "../controllers/addRecord";
import updateRecord from "../controllers/updateRecord";
import deleteRecord from "../controllers/deleteRecord";
import getRecord from "../controllers/getRecord";
import getAllRecords from "../controllers/getAllRecords";
import getSummary from "../controllers/getSummary";

const router = Router();

// useAuth always runs first — then role guard decides access

// viewer + analyst + admin
router.get("/records",          useAuth, isAnalyst,  getAllRecords);
router.get("/summary",   useAuth, isViewer,  getSummary);
router.get("/:id",       useAuth, isAnalyst,  getRecord);

// analyst + admin
router.post("/", useAuth, isAdmin, addRecord);

// admin only
router.put("/:id", useAuth, isAdmin,   updateRecord);
router.delete("/:id",useAuth, isAdmin,   deleteRecord);

export default router;