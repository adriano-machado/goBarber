import Sequelize, { Model } from 'sequelize';

import bcrypt from 'bcryptjs';

class User extends Model {
    static init(sequelize) {
        // Init recebee a conexão como segundo parâmetro
        super.init(
            {
                name: Sequelize.STRING,
                email: Sequelize.STRING,
                // VIRTUAL para campos que não vão existir efetivamente na base
                password: Sequelize.VIRTUAL,
                password_hash: Sequelize.STRING,
                provider: Sequelize.BOOLEAN,
            },
            {
                sequelize,
            }
        );
        this.addHook('beforeSave', async user => {
            if (user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8);
            }
        });
        return this;
    }

    static associate(models) {
        // Vou ter um id de arquivo armazenado no meu model de usuário
        this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
    }

    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash);
    }
}

export default User;
