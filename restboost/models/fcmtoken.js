module.exports = (sequelize, DataTypes) => {
	const fcmToken = sequelize.define('fcmtoken', {
    		id : {
    			type : DataTypes.INTEGER,
    			primaryKey : true,
    			autoIncrement : true
    		},
        token : {
            type : DataTypes.STRING(200),
            allowNull : false,
            unique : true
        }
	},
		{
            timestamps : false,
			      freezeTableName: true
		}
	);

	return fcmToken;
}
