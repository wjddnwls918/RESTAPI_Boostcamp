module.exports = (sequelize, DataTypes) => {
	const Board = sequelize.define('board', {
		id : {
			type : DataTypes.INTEGER,
			primaryKey : true,
			autoIncrement : true
		},
		address : {
			type : DataTypes.STRING(50),
			allowNull : false
		},
		title : {
			type : DataTypes.STRING(50),
			allowNull : false
		},
		time : {
			type : DataTypes.DATE,
			allowNull : false
		},
		max_person : {
			type : DataTypes.INTEGER,
			allowNull : false
		},
		current_person : {
			type : DataTypes.INTEGER,
			allowNull : false
		},
		restaurant_name : {
			type : DataTypes.STRING(50),
			allowNull : false
		},
		restaurant_address : {
			type : DataTypes.STRING(50),
			allowNull : false
		},
		writer_id : {
			type : DataTypes.INTEGER,
			allowNull : false
		},
		writer_time : {
			type : DataTypes.DATE,
			allowNull : false
		},
		validation : {
			type : DataTypes.INTEGER,
			allowNull : false,
			validate : {min : 0, max : 2}
		},
		content : {
			type : DataTypes.TEXT,
			allowNull : false
		},
		expire_date : {
			type : DataTypes.DATE,
			allowNull : false
		},
		longitude : {
			type : DataTypes.STRING(50),
			allowNull : false
		},
		latitude : {
			type : DataTypes.STRING(50),
			allowNull : false
		}
	},
		{
            timestamps : false,
			freezeTableName: true
		}
	);

	return Board;
}


