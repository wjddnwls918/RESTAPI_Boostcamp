module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('user', {
		id : {
			type : DataTypes.INTEGER,
			primaryKey : true,
			autoIncrement : true
		},
        nick_name : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        age : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        sex : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        photo : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        join_date : {
            type : DataTypes.DATE,
            allowNull : false
        },
        score_normal : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        score_good : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        score_great : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        score_sum : {
            type : DataTypes.INTEGER,
            allowNull : false
        }

		
	},
		{
            timestamps : false,
			freezeTableName: true
		}
	);

	return User;
}


