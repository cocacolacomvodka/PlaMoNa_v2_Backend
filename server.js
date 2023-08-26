const express = require('express');
const app = express();
const connection = require('./database');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({
  origin: true
}));

//Rota das medicoes atuais
app.post('/medicoes', (req, res) => {
  const periodo = req.body.periodo;
  let query = '';
  let id = '';

  if (periodo === 'semana') {
    query = 'SELECT AVG(nivel) as nivel, data FROM medicoes WHERE YEARWEEK(data) = YEARWEEK(NOW()) GROUP BY data';
    id ='Semana Atual';
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        const dado = results.map(result => {
          const { nivel, data } = result;
          const formattedDate = new Date(data).toLocaleString('pt-BR', { weekday: 'short' });
          return { "x": formattedDate, "y": nivel };
        });
  
        const chartData = {
          "id": id,
          "color": "hsl(500, 50%, 50%)",
          "data": dado
        };
  
        console.log(chartData); // Exibir o objeto do gráfico no console
        res.status(200).json(chartData);
      }
    });  
  } else if (periodo === 'semanaAnterior') {
    query = 'SELECT AVG(nivel) as nivel, data FROM medicoes WHERE YEARWEEK(data) = YEARWEEK(DATE_SUB(NOW(), INTERVAL 1 WEEK)) GROUP BY data';
    id ='Semana Anterior';
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        const dado = results.map(result => {
          const { nivel, data } = result;
          const formattedDate = new Date(data).toLocaleString('pt-BR', { weekday: 'short' });
          return { "x": formattedDate, "y": nivel };
        });
  
        const chartData = {
          "id": id,
          "color": "hsl(500, 50%, 50%)",
          "data": dado
        };
  
        console.log(chartData); // Exibir o objeto do gráfico no console
        res.status(200).json(chartData);
      }
    });  
  } else if (periodo === 'mes') {
    query = 'SELECT AVG(nivel), data FROM medicoes WHERE MONTH(data) = MONTH(CURDATE()) GROUP BY data';
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        const data = results.map(result => {
          const { nivel, data } = result;
          const formattedDate = new Date(data).toLocaleDateString('pt-BR',{ day: '2-digit', month: '2-digit' });
          return { "x": formattedDate, "y": nivel };
        });
  
        const chartData = {
          "id": "Mês",
          "color": "hsl(236, 95%, 69%)",
          "data": data
        };
  
        console.log(chartData); // Exibir o objeto do gráfico no console
        res.status(200).json(chartData);
      }
    });
  } else if (periodo==='dia') {
    query = 'SELECT nivel, DATE_FORMAT(hora, "%H:%i") as hora FROM medicoes WHERE data = CURDATE()';
  //const query = 'SELECT * FROM medicoes';

    connection.query(query, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        const data = results.map(result => {
          const { nivel, hora } = result;
          return { x: hora, y: nivel };
        });

        const chartData = {
          id: "Dia",
          color: "hsl(200, 50%, 50%)",
          data: data
        };

        console.log(chartData); // Exibir o objeto do gráfico no console
        res.status(200).json(chartData);
      }
    });
  } else {
    res.status(400).json({ error: 'Período inválido.' });
    return;
  }  
});

//Rota para comparar medicoes
app.post('/comparacao', (req, res) => {
  const periodo = req.body.periodo;
  const comp1 = req.body.comp_1;
  const comp2 = req.body.comp_2;
  const id1 = `${new Date(comp1).toLocaleString('pt-BR', { day: 'numeric',month: 'short', year: 'numeric' })}`;
  const id2 = `${new Date(comp2).toLocaleString('pt-BR', { day: 'numeric',month: 'short', year: 'numeric' })}`;
  let dado1 = '';
  let dado2 = '';
  let query1 = '';
  let query2 = '';

  if (periodo === 'semana') {
    query1 = `SELECT AVG(nivel) as nivel, data FROM medicoes WHERE YEARWEEK(data) = YEARWEEK('${comp1}') GROUP BY data`;
    query2 = `SELECT AVG(nivel) as nivel, data FROM medicoes WHERE YEARWEEK(data) = YEARWEEK('${comp2}') GROUP BY data`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, data } = result;
          const formattedDate = new Date(data).toLocaleString('pt-BR', { weekday: 'short' });
          return { x: formattedDate, y: nivel };
        });
  
        connection.query(query2, (error, results) => {
          if (error) {
            console.error('Erro ao obter dados do banco de dados:', error);
            res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
          } else {
            dado2 = results.map(result => {
              const { nivel, data } = result;
              const formattedDate = new Date(data).toLocaleString('pt-BR', { weekday: 'short' });
              return { x: formattedDate, y: nivel };
            });
  
            const chartData = [
              {
                id: id1,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
              {
                id: id2,
                color: 'hsl(300, 50%, 50%)',
                data: dado2,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
          }
        });
      }
    });
  } else if (periodo === 'mes') {
    query1 = `SELECT nivel, data FROM medicoes WHERE DATE_FORMAT(data, '%Y-%m') = DATE_FORMAT('${comp1}', '%Y-%m') AND HOUR(hora) = 14`;
    query2 = `SELECT nivel, data FROM medicoes WHERE DATE_FORMAT(data, '%Y-%m') = DATE_FORMAT('${comp2}', '%Y-%m') AND HOUR(hora) = 14`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, data } = result;
          const formattedDate = new Date(data).toLocaleDateString('pt-BR',{ day: '2-digit'});
          return { "x": formattedDate, "y": nivel };
        });
  
        connection.query(query2, (error, results) => {
          if (error) {
            console.error('Erro ao obter dados do banco de dados:', error);
            res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
          } else {
            dado2 = results.map(result => {
              const { nivel, data } = result;
              const formattedDate = new Date(data).toLocaleString('pt-BR', { day: '2-digit' });
              return { x: formattedDate, y: nivel };
            });
  
            const chartData = [
              {
                id: `${new Date(comp1).toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}`,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
              {
                id: `${new Date(comp2).toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}`,
                color: 'hsl(300, 50%, 50%)',
                data: dado2,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
          }
        });
      }
    });
  } else if (periodo === 'ano') {
    console.log(comp1);
    query1 = `SELECT 
    CASE m.mes
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Fev'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Abr'
      WHEN 5 THEN 'Mai'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Ago'
      WHEN 9 THEN 'Set'
      WHEN 10 THEN 'Out'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dez'
    END as mes,
    CASE WHEN n.nivel IS NOT NULL THEN ROUND(n.nivel, 2) ELSE 'null' END as nivel
  FROM (
    SELECT 1 as mes UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
  ) as m
  LEFT JOIN (
    SELECT MONTH(data) as mes, AVG(nivel) as nivel
    FROM medicoes
    WHERE YEAR(data) = YEAR('${comp1}')
    GROUP BY mes
  ) as n ON m.mes = n.mes
  GROUP BY m.mes
  ORDER BY m.mes;`;
    query2 = `SELECT 
    CASE m.mes
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Fev'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Abr'
      WHEN 5 THEN 'Mai'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Ago'
      WHEN 9 THEN 'Set'
      WHEN 10 THEN 'Out'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dez'
    END as mes,
    CASE WHEN n.nivel IS NOT NULL THEN ROUND(n.nivel, 2) ELSE 'null' END as nivel
  FROM (
    SELECT 1 as mes UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
  ) as m
  LEFT JOIN (
    SELECT MONTH(data) as mes, AVG(nivel) as nivel
    FROM medicoes
    WHERE YEAR(data) = YEAR('${comp2}')
    GROUP BY mes
  ) as n ON m.mes = n.mes
  GROUP BY m.mes
  ORDER BY m.mes;`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, mes } = result;
          return { "x": mes, "y": nivel };
        });
  
        connection.query(query2, (error, results) => {
          if (error) {
            console.error('Erro ao obter dados do banco de dados:', error);
            res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
          } else {
            dado2 = results.map(result => {
              const { nivel, mes } = result;
              return { x: mes, y: nivel };
            });
  
            const chartData = [
              {
                id: `${new Date(comp1).toLocaleString('pt-BR', { year: 'numeric' })}`,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
              {
                id: `${new Date(comp2).toLocaleString('pt-BR', { year: 'numeric' })}`,
                color: 'hsl(300, 50%, 50%)',
                data: dado2,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
          }
        });
      }
    });
  } else if (periodo === 'dia'){

    query1 = `SELECT nivel, DATE_FORMAT(hora, "%H:%i") as hora FROM medicoes WHERE data = DATE('${comp1}')`;
    query2 = `SELECT nivel, DATE_FORMAT(hora, "%H:%i") as hora FROM medicoes WHERE data = DATE('${comp2}')`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, hora } = result;
          return { "x": hora, "y": nivel };
        });
  
        connection.query(query2, (error, results) => {
          if (error) {
            console.error('Erro ao obter dados do banco de dados:', error);
            res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
          } else {
            dado2 = results.map(result => {
              const { nivel, hora } = result;
              return { x: hora, y: nivel };
            });
  
            const chartData = [
              {
                id: id1,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
              {
                id: id2,
                color: 'hsl(300, 50%, 50%)',
                data: dado2,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
          }
        });
      }
    });
  } else if (periodo === 'diaEsp'){

    query1 = `SELECT nivel, DATE_FORMAT(hora, "%H:%i") as hora FROM medicoes WHERE data = '${comp1}'`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, hora } = result;
          return { "x": hora, "y": nivel };
        });
            const chartData = [
              {
                id: id1,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
      }
    });
  }else {
    res.status(400).json({ error: 'Período inválido' });
    return;
  }
});

//Rota para registro de usuário
app.post('/api/register', (req, res) => {
  const { nome, cpf, endereco, email, telefone,  alerta_sms, alerta_email, senha } = req.body;
  const sql = 'INSERT INTO usuario (nome, cpf, endereco, email, telefone, alerta_sms, alerta_email, senha, sensor_id_sensor ) VALUES (?, 1)';
  const values = [nome, cpf, endereco, email, telefone, alerta_sms, alerta_email, senha];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao criar usuário:', err);
      res.status(500).json({ message: 'Erro ao criar usuário.', loginState: 0 });
    } else {
      res.json({ message: 'Usuário registrado com sucesso!', loginState: 1 });
    }
  });
});

//Rota para verificação de login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const mail = email;
  const password = senha;

  let query = "SELECT * FROM usuario WHERE email = ?;";

  connection.query(query, [mail], (err, result) => {
    if (err) {
      console.error('Erro ao consultar usuário:', err);
      res.status(500).json({ message: 'Erro ao consultar usuario.', loginState: 0  });
    } else if (result.length > 0) {
      let querySenha = "SELECT * FROM usuario WHERE email = ? AND senha = ?;";

      connection.query(querySenha, [mail, password], (err, result) => {
        if (err) {
          console.error('Erro ao consultar usuário:', err);
          res.status(500).json({ message: 'Erro ao consultar usuario.', loginState: 0 });
        } else if (result.length > 0) {
          res.status(200).json({ message: 'usuário logado com sucesso!', loginState: 1 });
        } else {
          res.status(200).json({ message: 'Senha Incorreta', loginState: 2 });
        }
      });
    } else {
      res.json({ message: 'usuário inexistente', loginState: 0 });
    }
  });
});

 app.listen(3000, () => {
   console.log('Servidor iniciado na porta 3000.');
 });