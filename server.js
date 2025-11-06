import express from "express";
import turmaRoutes from "./routes/turmaRoutes.js";
import cors from 'cors'; // <--- 1. Importe o cors

const app = express();

app.use(cors());

app.use(express.json());
app.use("/turmas", turmaRoutes);

app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});
