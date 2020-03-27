const { pt } = require('date-fns/locale/pt');
const { format, parseISO } = require('date-fns');
const Mail = require('../../lib/Mail');

class CancelationMail {
    get key() {
        return 'CancelationMail';
    }

    async handle({ data }) {
        const { appointment } = data;
        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento cancelado',
            template: 'cancelation',
            context: {
                provider: appointment.provider.name,
                user: appointment.user.name,
                date: format(
                    parseISO(appointment.date),
                    "'dia' dd 'de' MMMM', às' H:mm'h'",
                    {
                        locale: pt,
                    }
                ),
            },
        });
    }
}

module.exports = new CancelationMail();
