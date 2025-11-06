import express from "express";
// Importa os nomes corretos exportados pelo controller
import {
  listarTurmasDoProfessor,
  listarAlunosPorAlocacao,
  dadosUsuarioLogado
} from "../controllers/turmaController.js";

const router = express.Router();

// GET /turmas
// Agora chama a função correta: listarTurmasDoProfessor
router.get("/", listarTurmasDoProfessor);

// GET /turmas/:id/alunos
// Agora chama a função correta: listarAlunosPorAlocacao
router.get("/:id/alunos", listarAlunosPorAlocacao);

// Rota para buscar os dados do usuário/login (sugestão)
router.get("/usuario-logado", dadosUsuarioLogado);

export default router;