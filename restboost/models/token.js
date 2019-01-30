module.exports = (sequelize, DataTypes) => {
	const Token = sequelize.define('token', {
		id : {
			type : DataTypes.INTEGER,
			primaryKey : true,
			autoIncrement : true
		},
		access_token : {
			type : DataTypes.STRING(255),
			allowNull : false
		},
		expires_in : {
			type : DataTypes.INTEGER,
			allowNull : false
		},
		create_date : {
			type : DataTypes.DATE,
			allowNull : false
		},
		token_type : {
			type : DataTypes.STRING(255),
			allowNull : false
		},
		refresh_token : {
			type : DataTypes.STRING(255),
			allowNull : false
		},
		user_id : {
			type : DataTypes.INTEGER,
			allowNull : false
		}
	},
		{ 
            timestamps : false,
			freezeTableName: true
		}
	);

	return Token;
}


