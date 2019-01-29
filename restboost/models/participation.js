
module.exports = (sequelize, DataTypes) => {

	const Participation = sequelize.define('participation', {
		id : {
			type: DataTypes.INTEGER,
			primaryKey : true,
			autoIncrement: true
		},
		user_id : {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		join_time : {
			type: DataTypes.DATE,
			allowNull: false
		},
		board_id : {
			type: DataTypes.INTEGER,
			allowNull: false
		},

	},
		{  
            timestamps : false,
			freezeTableName : true
		}
	
	
	);



	return Participation;
}

