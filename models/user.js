const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                
            },
            email: {
                type: Sequelize.STRING(200),
                allowNull: false,
                validate: {
                    isEmail: true,
                }
            },
            pw: {
                type: Sequelize.STRING(200),
                allowNull: false, 
                validate: {
                   
                    
                }
            },
            name: {
                type: Sequelize.STRING(50),
                allowNull: false, 
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.User.belongsToMany(db.Post, {
            through: 'likes',
        });
        db.User.hasMany(db.Post);
    }
}