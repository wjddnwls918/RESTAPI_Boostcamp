const Sequelize = require('sequelize');

module.exports = (app,db) => {

    // test api

    app.get( "/board", (req,res) =>
        db.board.findAll().then( (result) => res.json(result))
        );

    app.get( "/comment", (req,res) =>
        db.comment.findAll().then( (result) => res.json(result))
        );

    app.get( "/token", (req,res) =>
        db.token.findAll().then( (result) => res.json(result) )
        );

    app.get( "/user", (req,res) =>
        db.user.findAll().then( (result) => res.json(result) )
        );

    app.get( "/participation", (req,res) =>
        db.participation.findAll().then( (result) => res.json(result))
        );



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

    /*
    project api
    boostcamp team d    

    */

    const Sequelize = require('sequelize');
    const Op = Sequelize.Op



    //Login---------------------------------------
    //카카오 로그인 시 토큰 정보 서버 저장
    app.post( "/login/token", (req,res) =>
        db.token.create({
            access_token : req.body.access_token,
            expires_in : req.body.expires_in,
            create_date : date,
            token_type : req.body.token_type,
            refresh_token: req.body.refresh_token,
            user_id : req.body.user_id
        }).then( (result) => res.json(result))
        );


    //카카오 로그인 시 유저 정보 서버 저장
    //이거 기존 사용자가 로그인 다시하면 안들어가게 해야됨 
    //미완 

    app.post( "/login/user", (req,res) => 
        db.user.create({
            nick_name : req.body.nick_name,
            age : req.body.age,
            sex : req.body.sex,
            photo : req.body.photo
        }).then( (result) => res.json(result))
        );

    //Home----------------------------------------

    

    //현재 사용자 위치를 기준으로 1okm안 추천 게시글을 가져옴 

/*

    app.get( "/home/board/:longitude/:latitude" , (req,res) =>
        db.board.findAll(
        {
            where : {
                getDistanceFromLatLonInKm( req.params.latitude, req.params.longitude,
               db.board.latitude, db.board.longitude) : {
                    [Op.lte] : 10
                }
            }
        }).then( (result) => res.json(result))
       // .catch( (error) => res.send("error occured") )
        );

*/
    app.get( "/rawtest" , (req,res)=>
    db.sequelize.query('select * from `user`')
        .then( user => {
            res.json(user)
        })
    );
         


    //score_sum 필드를 기준으로 사용자 등수를 가져옴

    function setQuery(access_token){

    var query = "";
    query += 'SELECT nick_name, score_sum, rank FROM';
    query += 'SELECT nick_name, score_sum, @vRank := @vRank + 1 AS rank';
    query += 'FROM user AS p, (SELECT @vRank != 0) AS r';
    query += 'ORDER BY score_sum DESC';
    query += ') AS CNT WHERE nick_name = ' + access_token +';';
    
    return query;

    }
/*
    app.get( "/home/ranking/me/:acces_token", (req,res) =>
            db.sequelize.query(setQuery(req.params.access_token))
            .then( myrank => {
                res.json(myrank)
            })
            
    );
*/



/*
    app.get( "/home/ranking/me/:access_token", (req,res) =>
        db.token.findOne(
        {
            attributes : ['user_id'],
            where {
                access_token : req.params.access_token
            }
        }).then( foundUser => {
            return foundUser.get()
        }).then( userData => {
            //user_id를 기준으로 
  */          




    //Score_sum 필드를 기준으로 상위 10명에 대한 사용자 정보(사진, 닉네임)
    app.get( "/home/ranking/user", (req,res) =>
        db.user.findAll(
        {
            attributes : ['nick_name','photo'],
            offset: 0,
            limit: 10,
            order: [['score_sum', 'DESC']]
        }).then( (result) => res.json(result))
       
       ); 
    


    //Map-----------------------------------------


    //Board_Preview-------------------------------


    //Map_Search----------------------------------


    //Board_List----------------------------------


    //Board_Add-----------------------------------

    //사용자가 작성한 게시글 등록
    app.post( "/board", (req,res) =>
        db.board.create({
            address : req.body.address,
            title : req.body.title,
            appointed_time : req.body.appointed_time,
            max_pserson : req.body.max_person,
            current_person : req.body.current_person,
            restaurant_name : req.body.restaurant_name,
            restaurant_address : req.body.restaurant_address,
            writer_id : req.body.writer_id,
            write_date : req.body.write_date,
            validation : req.body.validation,
            content : req.body.content,
            expire_date : req.body.expire_date,
            longitude : req.body.longitude,
            latitude : req.body.latitude
        }).then( (result) => res.json(result) )
        );


    //Board_Detail--------------------------------

    //게시글에 달린 댓글 불러오기
    app.get( "/comment/list/:board_id", (req,res) =>
        db.comment.findAll({
        where: {
            board_id : req.params.board_id
        }

        }).then( (result) => res.json(result) )
        );


    //User_Evaluation-----------------------------


    


    //MyPage_Edit---------------------------------

    //닉네임, 나이 , 성별 , 프로필 사진업데이트
   
  
   app.put( "/mypage/:nick_name", (req,res) =>
         db.user.update({
            nick_name : req.body.nick_name,
            age : req.body.age,
            sex : req.body.sex,
            photo : req.body.photo
         }, {
             where : {
                 nick_name : req.params.nick_name
             }
         }
         
         
         ).then( (result) => res.json(result) )
   );
  



}



function returnDate() {
    return new Date();
}

function getDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) {
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}
