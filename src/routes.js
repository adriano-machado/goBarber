import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import FileController from './app/controllers/FileController';

import SessionController from './app/controllers/SessionController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';

import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const upload = multer(multerConfig);

const routes = new Router();

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);
routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.post('/files', upload.single('file'), FileController.store);
routes.post('/appointments', AppointmentController.store);
routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.get('/schedules', ScheduleController.index);

export default routes;
