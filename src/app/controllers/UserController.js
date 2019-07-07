const User = require('../models/User');

class UserController {
    async store(req, res) {
        const userExists = await User.findOne({
            where: { email: req.body.email },
        });
        if (userExists) {
            return res.status(400).json({ error: ' Usuário já cadastrado' });
        }
        const user = await User.create(req.body);
        const { id, name, provider, email } = user;

        return res.json({ id, name, provider, email });
    }

    async update(req, res) {
        const { email, oldPassword } = req.body;

        const user = await User.findByPk(req.userId);

        if (email !== user.email) {
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
