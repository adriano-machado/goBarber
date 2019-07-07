const { Router } = require('express');
const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

module.exports = routes;
