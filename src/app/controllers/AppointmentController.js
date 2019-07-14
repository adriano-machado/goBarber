const Yup = require('yup');
const { startOfHour, parseISO, isBefore } = require('date-fns');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

class AppointmentController {
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
        const isProvider = await User.findOne({
            where: {
                id: provider_id,
                provider: true,
            },
        });

        if (!isProvider) {
            return res.status(401).json({
                error: 'You can only creat appointments with providers',
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
            date,
            provider_id,
        });

        return res.json(appointment);
    }
}

module.exports = new AppointmentController();
