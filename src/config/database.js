module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'docker',
    database: 'GoBarber',
    define: {
        timestaps: true,
        // Criar tabelas a partir dos models usando _, por exemplo user_table
        underscored: true,
        underscoredAll: true,
    },
};
