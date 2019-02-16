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
            type : DataTypes.INTEGER,
            allowNull : false,
            validate : { min : 0 , max : 1 }
        },
        photo : {
            type : DataTypes.TEXT,
            allowNull : false
        },
        join_date : {
            type : DataTypes.DATE,
            allowNull : true,
            defaultValue : DataTypes.NOW
        },
        score_normal : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 0
        },
        score_good : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 0
        },
        score_great : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 0
        },
        score_sum : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 0
        },
        kakao_id : {
            type : DataTypes.BIGINT,
            allowNull : false,
						unique : true
        }


	},
		{
            timestamps : false,
			freezeTableName: true
		}
	);

	return User;
}
