import express from 'express';
import router from './routes/userRoutes';
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

/* 3️⃣ Routes AFTER CORS + OPTIONS */
app.use("/api/v1", router);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});


export default app;