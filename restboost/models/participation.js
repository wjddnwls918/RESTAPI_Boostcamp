
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
			allowNull: false,
            defaultValue : DataTypes.NOW
		},
		board_id : {
			type: DataTypes.INTEGER,
			allowNull: false
		},
        isEvaluated : {
            type : DataTypes.BOOLEAN,
            allowNull : false,
            defaultValue : false
        }

	},
		{  
            timestamps : false,
			freezeTableName : true
		}
	
	
	);



	return Participation;
}

