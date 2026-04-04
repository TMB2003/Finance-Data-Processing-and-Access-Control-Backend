import express from 'express';
import router from './routes/recordRoutes';
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

/* Routes */
app.use("/api/v1", router);

export default app;
