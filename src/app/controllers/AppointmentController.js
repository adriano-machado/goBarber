const Yup = require('yup');
const {
    startOfHour,
    parseISO,
    isBefore,
    format,
    subHours,
} = require('date-fns');
const pt = require('date-fns/locale/pt');

const Appointment = require('../models/Appointment');
const File = require('../models/File');

const User = require('../models/User');
const Notification = require('../schemas/Notification');

const CancelationMail = require('../jobs/CancelationMail');
const Queue = require('../../lib/Queue');

class AppointmentController {
    async index(req, res) {
        const { page = 1 } = req.query;

        const appointments = await Appointment.findAll({
            where: {
                user_id: req.userId,
                canceled_at: null,
            },
            attributes: ['id', 'date'],
            order: ['date'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['name', 'id'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['url', 'id', 'path'],
                        },
                    ],
                },
            ],
        });
        return res.json(appointments);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            date: Yup.date().required(),
            provider_id: Yup.number().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }
        const { date, provider_id } = req.body;
        /**
         * Check if provider_id is a provider
         */

        if (provider_id === req.userId) {
            return res.status(401).json({
                error: 'You cannot create appointments with you',
            });
        }
        const isProvider = await User.findOne({
            where: {
                id: provider_id,
                provider: true,
            },
        });

        if (!isProvider) {
            return res.status(401).json({
                error: 'You can only create appointments with providers',
            });
        }

        /**
         * check for Past Dates
         */
        const hourStart = startOfHour(parseISO(date));
        if (isBefore(hourStart, new Date())) {
            return res
                .status(400)
                .json({ error: 'Past date are not permited' });
        }
        /**
         * Check date availability
         */
        const checkAvailability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart,
            },
        });

        if (checkAvailability) {
            return res
                .status(400)
                .json({ error: 'Appointment date is not available' });
        }

        const appointment = await Appointment.create({
            user_id: req.userId,
            date: hourStart,
            provider_id,
        });

        /**
         * Notify appointment provider
         */

        const user = await User.findByPk(req.userId);
        const formattedDate = format(
            hourStart,
            "'dia' dd 'de' MMMM', às' H:mm'h'",
            {
                locale: pt,
            }
        );
        await Notification.create({
            content: `Novo agendamento de ${user.name} para ${formattedDate}`,
            user: provider_id,
        });

        return res.json(appointment);
    }

    async delete(req, res) {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['name', 'email'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name'],
                },
            ],
        });
        if (appointment.user_id !== req.userId) {
            return res.status(401).json({
                error: "You don't have permission to cancel this appointment",
            });
        }
        const dateWithSub = subHours(appointment.date, 2);

        if (isBefore(dateWithSub, new Date())) {
            return res.status(401).json({
                error: 'You can only cancel appointments two hours in advance',
            });
        }

        appointment.canceled_at = new Date();
        await appointment.save(appointment);
        Queue.add(CancelationMail.key, { appointment });
        return res.json(appointment);
    }
}

module.exports = new AppointmentController();
