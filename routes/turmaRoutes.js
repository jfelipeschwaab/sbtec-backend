import express from "express";
import {
  listarTurmasDoProfessor,
  listarAlunosPorAlocacao,
  dadosUsuarioLogado,
  registrarPresenca // <--- IMPORTANTE: Importe a nova função
} from "../controllers/turmaController.js";

const router = express.Router();

router.get("/", listarTurmasDoProfessor);
router.get("/:id/alunos", listarAlunosPorAlocacao);
router.get("/usuario-logado", dadosUsuarioLogado);

// NOVA ROTA POST PARA SALVAR
router.post("/registrar-presenca", registrarPresenca);

export default router;