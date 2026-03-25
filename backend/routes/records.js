const express = require("express");
const router = express.Router();
const { pool, connectPacientes, sql } = require("../database/database");

//Rota para buscar registros através do prontuário - Método GET
router.get("/prontuario/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // connectPacientes agora é um pool MySQL
    const [rows] = await connectPacientes.query(
      `SELECT codatendimento, prontuario, nome, sexo, datanascimento, cid, classificacao
       FROM szpaciente
       WHERE prontuario = ?
       ORDER BY codatendimento DESC`, 
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Prontuário não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar prontuário:", err);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

//Rota para inclusão de dados - Método POST
router.post("/", async (req, res) => {
  try {
    const {
      codatendimento,
      prontuario,
      nomepaciente,
      sexo,
      datanascimento,
      classificacao,
      cid,
      exame,
      qtdincidencias,
      origem,
      reexposicao,
      motivo,
      datarealizada,
      horapedido,
      horarealizada,
      nometecnico,
    } = req.body;

    const query = `
      INSERT INTO registros(
        codatendimento, prontuario, nomepaciente, sexo, datanascimento, classificacao, cid, exame, qtdincidencias,
        origem, reexposicao, motivo, datarealizada,
        horapedido, horarealizada, nometecnico
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      codatendimento,
      prontuario,
      nomepaciente,
      sexo,
      datanascimento,
      classificacao,
      cid,
      exame,
      qtdincidencias,
      origem,
      reexposicao,
      motivo,
      datarealizada,
      horapedido,
      horarealizada,
      nometecnico,
    ].map(v => v === "" ? null : v);

    const [results] = await pool.query(query, valores);

    res.status(201).json({ message: "Registro salvo com sucesso!" });

  } catch (err) {
    console.error("Erro ao inserir registro:", err);
    res.status(500).json({ error: "Erro ao salvar no banco de dados" });
  }
});

//Rota para buscar os dados - Método GET
router.get("/", async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT * FROM registros
      ORDER BY id DESC
    `);

    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

//Rota para fazer consultas mais específicas via GET
router.get("/filtro", async (req, res) => {
  const { dataInicio, dataFim, exame, sexo, origem, idadeInicio, idadeFim } = req.query;

  let query = `
    SELECT * 
    FROM registros 
    WHERE 1=1
  `;
  const values = [];

  if (!dataInicio && !dataFim) {
    query += " AND datarealizada >= DATE_SUB(NOW(), INTERVAL 10 DAY)";
  }
  
  if (dataInicio && dataFim) {
    query += " AND datarealizada BETWEEN ? AND ?";
    values.push(dataInicio, dataFim);
  }

  if (exame) {
    query += " AND exame = ?";
    values.push(exame);
  }

  if (sexo) {
    query += " AND sexo = ?";
    values.push(sexo);
  }

  if (origem) {
    query += " AND origem = ?";
    values.push(origem);
  }

  if (idadeInicio && idadeFim) {
    query += " AND TIMESTAMPDIFF(YEAR, datanascimento, CURDATE()) BETWEEN ? AND ?";
    values.push(idadeInicio, idadeFim);
  }

  query += " ORDER BY datarealizada DESC";

  try {
    const [results] = await pool.query(query, values);
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});


//Rota para editar um registro - Método PUT
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nomepaciente,
      sexo,
      datanascimento,
      exame,
      qtdincidencias,
      origem,
      reexposicao,
      motivo,
      datarealizada,
      horapedido,
      horarealizada,
      nometecnico,
    } = req.body;

    const query = `
      UPDATE registros SET 
        nomepaciente = ?, 
        sexo = ?, 
        datanascimento = ?, 
        exame = ?, 
        qtdincidencias = ?, 
        origem = ?, 
        reexposicao = ?, 
        motivo = ?, 
        datarealizada = ?, 
        horapedido = ?, 
        horarealizada = ?, 
        nometecnico = ?
      WHERE id = ?
    `;

    const values = [
      nomepaciente,
      sexo,
      datanascimento,
      exame,
      qtdincidencias,
      origem,
      reexposicao,
      motivo,
      datarealizada,
      horapedido,
      horarealizada,
      nometecnico,
      id,
    ].map(v => v === "" ? null : v);

    await pool.query(query, values);

    res.sendStatus(200);

  } catch (err) {
    console.error("Erro ao atualizar registro:", err);
    res.status(500).send("Erro ao atualizar registro");
  }
});


//Rota para deletar um registro - Método DELETE
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = "DELETE FROM registros WHERE id = ?";

    const [results] = await pool.query(query, [id]);

    res.json(results);

  } catch (err) {
    console.error("Erro ao excluir registros:", err);
    res.status(500).json({ error: "Erro ao excluir registros" });
  }
});


module.exports = router;