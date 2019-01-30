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
		appointed_time : {
			type : DataTypes.DATE,
			allowNull : false
		},
		max_person : {
			type : DataTypes.INTEGER,
			allowNull : false
		},
		current_person : {
			type : DataTypes.INTEGER,
			allowNull : false,
            defaultValue : 1
		},
		restaurant_name : {
			type : DataTypes.STRING(50),
			allowNull : false,
            defaultValue : ""
		},
		writer_id : {
			type : DataTypes.INTEGER,
			allowNull : false
		},
		write_date : {
			type : DataTypes.DATE,
			allowNull : false,
            defaultValue : DataTypes.NOW
		},
		validation : {
			type : DataTypes.INTEGER,
			allowNull : false,
            defaultValue : 0,
			validate : {min : 0, max : 2}
		},
		content : {
			type : DataTypes.TEXT,
			allowNull : false
		},
		expire_date : {
			type : DataTypes.DATE,
			allowNull : true
		},
		longitude : {
			type : DataTypes.DOUBLE,
			allowNull : false
		},
		latitude : {
			type : DataTypes.DOUBLE,
			allowNull : false
		},
        budget : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 0
        },
        min_age : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        max_age : {
            type : DataTypes.INTEGER,
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


