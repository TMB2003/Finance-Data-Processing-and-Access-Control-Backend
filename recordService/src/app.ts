import express from 'express';
import router from './routes/recordRoutes';
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

/* Routes */
app.use("/api", router);

export default app;
