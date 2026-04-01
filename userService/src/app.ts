import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

/* 3️⃣ Routes AFTER CORS + OPTIONS */
// app.use("/api", router);


export default app;