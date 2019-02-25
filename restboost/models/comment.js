module.exports = (sequelize, DataTypes) => {
	const Comment = sequelize.define('comment', {
		id : {
			type : DataTypes.INTEGER,
			primaryKey : true,
			autoIncrement : true
		},
		kakao_id : {
			type : DataTypes.BIGINT,
			allowNull : false
		},
		board_id : {
			type : DataTypes.INTEGER,
			allowNull : false
		},
		write_time : {
			type : DataTypes.DATE,
			allowNull : false
		},
		content : {
			type : DataTypes.TEXT,
			allowNull : false
		}
	},
		{ 
            timestamps : false,
			freezeTableName: true
		}
	);

	return Comment;
}


