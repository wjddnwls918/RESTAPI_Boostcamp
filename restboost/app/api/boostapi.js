const Sequelize = require('sequelize');

module.exports = (app,db) => {

	app.get( "/", (req,res) => 
		{
			res.send("Hello") 
		}
	);

	app.get( "/test" , (req,res) => 
		{
			res.send("This is test");
		}
	);

	app.get( "/select", (req,res) => 
		db.participation.findAll().then( (result) => res.json(result) )
	);
			
    app.get( "/test/:test", (req,res) => 
        {
            res.send("test is : " + req.params.test );
            //test();
            console.log(new Date());
        });


    var date = returnDate();

    app.post( "/insertToParticipation", (req,res) => 
        db.participation.create({
                user_id : 1,
                join_time : date,
                board_id : 1 
            }).then( ( result ) => res.json(result) )
        );



}



function returnDate() {
    return new Date();
}

function test() {
    console.log("test");
}

