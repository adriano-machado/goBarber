const { Router } = require('express');
const User = require('./app/models/User');

const routes = new Router();

routes.get('/', async (req, res) => {
    const user = await User.create({
        name: 'teste',
        email: 'te2te22',
        password_hash: '123332123',
    });
    return res.json({ message: 'parabéns' });
});

module.exports = routes;
