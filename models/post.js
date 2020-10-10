const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            }, 
            author: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            mainImg: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING(5000),
                allowNull: false,
            },
            posterImg: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            previewImg: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            preview: {
                type: Sequelize.STRING(5000),
                allowNull: false,
            },
            views: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            rating: {
                type: Sequelize.FLOAT,
                allowNull: true,

            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            director: {
                type: Sequelize.STRING(100),
                allownull: true,
            }
            
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Post.belongsTo(db.User);
        db.Post.belongsToMany(db.User, {
            through: 'likes'
        });
        db.Post.belongsToMany(db.Tag, {
            through: 'hashtag'
        });
    }
}