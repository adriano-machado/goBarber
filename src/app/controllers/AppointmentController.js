const Yup = require('yup');
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

        const appointment = await Appointment.create({
            user_id: req.userId,
            date,
            provider_id,
        });

        return res.json(appointment);
    }
}

module.exports = new AppointmentController();
