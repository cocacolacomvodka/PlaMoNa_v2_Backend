const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '${{ secrets.IP_BANCO }}',
  user: '${{ secrets.USER_DO_BANCO }}',
  password: '${{ secrets.SENHA_DO_BANCO }}',
  database: 'geovanegri_plamona_v2',
});

connection.connect((error) => {
  if (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } else {
    console.log('Conexão bem-sucedida com o banco de dados.');
  }
});

module.exports = connection;