const Yup = require('yup');
const User = require('../models/User');

class UserController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string()
                .email()
                .required(),
            password: Yup.string()
                .required()
                .min(6),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation error' });
        }

        const userExists = await User.findOne({
            where: { email: req.body.email },
        });
        if (userExists) {
            return res.status(400).json({ error: ' Usuário já cadastrado' });
        }
        const user = await User.create(req.body);
        const { id, name, provider, email } = user;

        return res.status(200).json({ id, name, provider, email });
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string(),
            oldPassword: Yup.string().min(6),
            password: Yup.string()
                .min(6)
                .when('oldPassword', (oldPassword, field) => {
                    return oldPassword ? field.required() : field;
                }),
            confirmPassword: Yup.string().when(
                'password',
                (password, field) => {
                    return password
                        ? field.required().oneOf([Yup.ref('password')])
                        : field;
                }
            ),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation error' });
        }
        const { email, oldPassword } = req.body;

        const user = await User.findByPk(req.userId);

        if (email && email !== user.email) {
            const userExists = await User.findOne({
                where: { email },
            });
            if (userExists) {
                return res
                    .status(400)
                    .json({ error: ' Usuário já cadastrado' });
            }
        }

        if (oldPassword && !(await user.checkPassword(oldPassword))) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const { id, name, provider } = await user.update(req.body);

        return res.json({ id, name, provider, email });
    }
}
module.exports = new UserController();
