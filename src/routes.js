const { Router } = require('express');
const multer = require('multer');
const UserController = require('./app/controllers/UserController');
const FileController = require('./app/controllers/FileController');

const SessionController = require('./app/controllers/SessionController');
const ProviderController = require('./app/controllers/ProviderController');
const AppointmentController = require('./app/controllers/AppointmentController');
const ScheduleController = require('./app/controllers/ScheduleController');
const NotificationController = require('./app/controllers/NotificationController');

const authMiddleware = require('./app/middlewares/auth');
const multerConfig = require('./config/multer');

const upload = multer(multerConfig);

const routes = new Router();

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);
routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.get('/providers', ProviderController.index);
routes.post('/files', upload.single('file'), FileController.store);
routes.post('/appointments', AppointmentController.store);
routes.get('/appointments', AppointmentController.index);
routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.get('/schedules', ScheduleController.index);

module.exports = routes;
