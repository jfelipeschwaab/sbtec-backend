import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';


// --- Carregamento do Mock ---
// Assume que 'mock_dados_app.json' está no mesmo diretório
// Se não estiver, ajuste o caminho.
let data;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mockPath = path.join(__dirname, 'mock_dados_app.json');
try {
  if (fs.existsSync(mockPath)) {
    const jsonData = fs.readFileSync(mockPath, "utf-8");
    data = JSON.parse(jsonData);
  } else {
    console.warn("⚠️ Arquivo mock não encontrado, criando estrutura vazia.");
    data = { respostaAlocacoes: [], respostaAlunosPorAlocacao: {}, registrosPresenca: [], dadosLogin: {} };
  }
} catch (error) {
  console.error("❌ ERRO FATAL: Não foi possível ler o arquivo mock_dados_app.json.", error);
  data = { respostaAlocacoes: [], respostaAlunosPorAlocacao: {}, registrosPresenca: [], dadosLogin: {} };
}


/**
 * Endpoint: Listar Alocações (Turmas/Disciplinas) do Professor
 *
 * Filtra as alocações do professor com base no ano escolar e/ou disciplina.
 * O filtro de "etapa" (bimestre) não se aplica aqui, pois ele é usado
 * apenas no momento de *registrar a frequência*, não para listar as turmas.
 */
export function listarTurmasDoProfessor(req, res) {
  try {
    const { ano, disciplina } = req.query;

    let alocacoesFiltradas = data.respostaAlocacoes;

    // 1. Filtrar por Ano Escolar
    if (ano) {
      alocacoesFiltradas = alocacoesFiltradas.filter(
        alocacao => alocacao.turma.ano_escolar === parseInt(ano)
      );
    }

    // 2. Filtrar por Disciplina (case-insensitive)
    if (disciplina) {
      alocacoesFiltradas = alocacoesFiltradas.filter(
        alocacao => alocacao.disciplina.nome.toLowerCase() === disciplina.toLowerCase()
      );
    }

    // 3. Formatar a resposta para o frontend
    // Enviamos apenas os dados limpos que o frontend precisa para exibir a lista.
    const respostaFormatada = alocacoesFiltradas.map(alocacao => ({
      id_alocacao: alocacao.id_alocacao,
      nome_turma: alocacao.turma.nome,
      ano_escolar: alocacao.turma.ano_escolar,
      nome_disciplina: alocacao.disciplina.nome,
    }));

    res.status(200).json(respostaFormatada);

  } catch (error) {
    console.error("❌ Erro ao listar alocações (turmas) do professor:", error);
    res.status(500).json({ message: "Erro ao processar sua solicitação." });
  }
}

/**
 * Endpoint: Listar Alunos de uma Alocação (para fazer a chamada)
 *
 * Busca a lista de alunos de uma turma/disciplina específica
 * usando o `id_alocacao`
 */
export function listarAlunosPorAlocacao(req, res) {
  try {
    // O ID recebido na rota é o `id_alocacao`
    const idAlocacao = req.params.id; // Vem como string

    // 1. Buscar a alocação para ter os detalhes (nome da turma, etc.)
    const alocacaoInfo = data.respostaAlocacoes.find(
      a => a.id_alocacao == idAlocacao
    );

    if (!alocacaoInfo) {
      return res.status(404).json({ message: "Turma/Alocação não encontrada." });
    }

    // 2. Buscar a lista de alunos usando o ID como CHAVE no objeto
    const alunos = data.respostaAlunosPorAlocacao[idAlocacao];

    if (!alunos) {
      console.warn(`Alunos não encontrados para alocação ${idAlocacao}, mas alocação existe.`);
      return res.status(200).json({
        // Retorna os dados da turma, mas com a lista de alunos vazia
        info: alocacaoInfo,
        alunos: [],
      });
    }

    // 3. Montar a resposta completa para o frontend
    const respostaFormatada = {
      info: {
        id_alocacao: alocacaoInfo.id_alocacao,
        nome_turma: alocacaoInfo.turma.nome,
        ano_escolar: alocacaoInfo.turma.ano_escolar,
        nome_disciplina: alocacaoInfo.disciplina.nome,
      },
      alunos: alunos // A lista de alunos vinda do mock
    };

    res.status(200).json(respostaFormatada);

  } catch (error) {
    console.error("❌ Erro ao listar alunos da alocação:", error);
    res.status(500).json({ message: "Erro ao processar sua solicitação." });
  }
}

/**
 * Endpoint: Login (Simulação)
 *
 * Apenas retorna os dados de login do mock para o frontend saber
 * quem está logado.
 */
export function dadosUsuarioLogado(req, res) {
  try {
    // Em um app real, aqui você validaria o SIGRH e Senha
    // Aqui, apenas retornamos os dados do mock.
    res.status(200).json(data.dadosLogin);
  } catch (error) {
    console.error("❌ Erro ao buscar dados de login:", error);
    res.status(500).json({ message: "Erro ao processar sua solicitação." });
  }
}

export function registrarPresenca(req, res) {
  try {
    const { id_alocacao, data: dataAula, etapa, presencas } = req.body;

    // 1. Validação simples
    if (!id_alocacao || !presencas) {
      return res.status(400).json({ message: "Dados incompletos." });
    }

    // 2. Adicionar ao objeto em memória
    const novoRegistro = {
      id: Date.now(), // ID único simples
      id_alocacao,
      data_aula: dataAula,
      etapa,
      registros: presencas // array [{id_aluno, presente}]
    };

    if (!data.registrosPresenca) data.registrosPresenca = [];
    data.registrosPresenca.push(novoRegistro);

    // 3. SALVAR NO ARQUIVO FÍSICO (Persistência)
    fs.writeFileSync(mockPath, JSON.stringify(data, null, 2));

    // =====================================================
    // LOGS DE TESTE NO CONSOLE DO BACKEND
    // =====================================================
    console.log("\n===========================================");
    console.log(`📝 REGISTRO DE CHAMADA RECEBIDO`);
    console.log(`📅 Data: ${dataAula} | Etapa: ${etapa}`);
    console.log(`🏫 ID Alocação: ${id_alocacao}`);
    console.log("-------------------------------------------");
    
    // Recupera lista de alunos original para pegar os nomes
    const alunosTurma = data.respostaAlunosPorAlocacao[id_alocacao] || [];

    let totalPresentes = 0;
    let totalFaltas = 0;

    presencas.forEach(registro => {
        const alunoInfo = alunosTurma.find(a => a.id_aluno === registro.id_aluno);
        const nomeAluno = alunoInfo ? alunoInfo.nome : `Aluno ID ${registro.id_aluno}`;
        const status = registro.presente ? "✅ PRESENTE" : "❌ FALTA";
        
        if (registro.presente) totalPresentes++; else totalFaltas++;

        // O PRINT QUE VOCÊ PEDIU:
        console.log(`${status} - ${nomeAluno}`);
    });

    console.log("-------------------------------------------");
    console.log(`Resumo: ${totalPresentes} Presentes, ${totalFaltas} Faltas.`);
    console.log("===========================================\n");
    // =====================================================

    res.status(201).json({ message: "Presença registrada com sucesso!", id_registro: novoRegistro.id });

  } catch (error) {
    console.error("Erro ao salvar presença:", error);
    res.status(500).json({ message: "Erro interno ao salvar." });
  }
}