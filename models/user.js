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
                    //비밀번호 정규식
                    is: { 
                        args: /(?=.*\d{1,50})(?=.*[~`!@#$%\^&*()-+=]{1,50})(?=.*[a-zA-Z]{2,50}).{8,50}$/,
                        msg: "8자 이상 영문, 숫자, 특수문자를 반드시 포함하여 주세요."},
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