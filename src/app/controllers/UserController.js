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
        const { id, name, provider } = user;

        return res.json({ id, name, provider });
    }
}
module.exports = new UserController();
