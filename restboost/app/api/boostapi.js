const Sequelize = require('sequelize');

module.exports = (app,db) => {

    // test api 및  util api


    //테이블 조회
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





    //--------------------------------------------
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


    function getMyRanking(access_token) {

      var query = "";

      query += "SELECT id,nick_name, score_sum, rank FROM (";
      query += "SELECT    id,";
      query += "nick_name,";
      query += "score_sum,";
      query += "@vRank := @vRank + 1 AS rank ";
      query += "FROM      `user` AS p, (SELECT @vRank := 0) AS r ";
      query += "ORDER BY  score_sum DESC ";
      query += ") AS CNT WHERE id = (SELECT `user_id` FROM `token` WHERE `access_token` = "+access_token+");";

      return query;
    }

    app.get( "/home/ranking/me" , (req,res) =>

      db.sequelize.query( getMyRanking( req.headers.access_token) )
      .then( (result) => res.json(result))



    );



    //현재 사용자 위치를 기준으로 1okm안 추천 게시글을 가져옴

    function getRecommendBoard(longitude, latitude) {
        var query ="";

        query += "SELECT * FROM `board` WHERE `longitude` >= "+(longitude - 0.05)+" AND `longitude` <= "+(longitude + 0.05);
        query += " AND `latitude` >= "+(latitude - 0.05)+" AND `latitude` <= "+(latitude + 0.05)+" limit 4;";


        return query;

    }


    app.get( "/home/board/:longitude/:latitude", (req,res) =>
        db.sequelize.query( getRecommendBoard( req.params.longitude, req.params.latitude ) )
        .then( result => res.json(result))


    );




    //score_sum 필드를 기준으로 사용자 등수를 가져옴





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

    //사용자가 지정한 위치의 경도, 위도를 보내 게시글의 리스트를 가져옴

    function getCurrentPosBoard(left_longitude, left_latitude, right_longitude, right_latitude) {

        var query = "";

        query += "SELECT * FROM `board` WHERE `longitude` >= "+left_longitude+" AND `longitude` <= "+right_longitude;
        query += " AND `latitude` >= "+left_latitude+" AND `latitude` <= "+right_latitude;


        return query;

    }


    app.get( "/map/list", (req,res) =>
            db.sequelize.query( getCurrentPosBoard( req.query.left_longitude, req.query.left_latitude, req.query.right_longitude, req.query.right_latitude) )
            .then( result => res.json(result) )

        );


    //Board_Preview-------------------------------


    //Map_Search----------------------------------



    //검색어로 위치에 해당하는 게시글 검색하기
    function getSearchBoard(address, min_time, max_time, min_age, max_age, budget ) {

        var query = "";

        query += "SELECT * FROM `board` WHERE address like "+address+" and appointed_time >= date_add(date(now()), INTERVAL "+min_time+" hour)";
        query += " and appointed_time <= date_add(date(now()), INTERVAL "+max_time+" hour) and min_age >= "+min_age+" and max_age <= "+max_age+"";
        query += " and budget <= "+budget+"";

        return query;


    }


    app.get( "/search/list" , (req,res) => {
        db.sequelize.query( getSearchBoard(req.query.address, req.query.min_time, req.query.max_time, req.query.min_age, req.query.max_age, req.query.budget) )
        .then( (result) => res.json(result) )

        }

     );


/*
    app.get( "/search/list" , (req,res) =>
        res.send("test")
        );
*/


    //Board_List----------------------------------

    //사용자가 생성한 게시글 불러오기
    function getMyBoard( access_token ) {

        var query = "";

        query += "SELECT b.id, b.address, b.title, b.appointed_time, b.current_person, b.max_person, b.write_date, b.content,";
        query += "b.latitude, b.longitude, b.budget, b.min_age, b.max_age ,";
        query += "u.nick_name, u.photo FROM board b ";
        query += "LEFT JOIN user u ON b.writer_id = u.id ";
        query += "LEFT JOIN token t ON u.id = t.user_id ";
        query += "WHERE t.access_token LIKE "+access_token;

        return query;

    }


    app.get( "/board/list/my" , (req,res) =>
        db.sequelize.query( getMyBoard( req.headers.access_token ) )
        .then( (result) => res.json(result) )

        );


    //사용자가 참여중인 게시글 불러오기

    function currentJoinBoard( access_token ) {

        var query ="";


        query +="SELECT b.id, b.address, b.title, b.appointed_time, b.current_person, b.max_person, b.write_date, b.content,";
        query +="b.latitude, b.longitude, b.budget, b.min_age, b.max_age, u.photo, u.nick_name";
        query +=" FROM board b ";
        query +="LEFT JOIN participation p ON p.board_id = b.id ";
        query +="LEFT JOIN user u ON b.writer_id = u.id ";
        query +="LEFT JOIN token t ON t.user_id = p.user_id ";
        query +="WHERE t.access_token LIKE "+access_token +" AND b.writer_id != t.user_id;";



        return query;

    }

    app.get( "/board/list/participation/", (req,res) =>

        db.sequelize.query( currentJoinBoard ( req.headers.access_token ) )
        .then( result => res.json(result))


    );


    //Board_Add-----------------------------------

    //사용자가 작성한 게시글 등록
    app.post( "/board", (req,res) =>
        db.board.create({
            title : req.body.title,
            address : req.body.address,
            appointed_time : req.body.appointed_time,
            max_person : req.body.max_person,
            writer_id : req.body.writer_id,
            min_age : req.body.min_age,
            max_age : req.body.max_age,
            budget : req.body.budget,
            content : req.body.content,
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


    function updateUserScoreQuery(users) {

        console.log( typeof(users) );


        /*
        var query = "";

        query += "SET @score=2;";
        query += "UPDATE USER u";
        query += "SET";

        query += "score_normal = IF(@score=2, u.score_normal+1, u.score_normal),";
        query += "score_good = IF(@score=3, u.score_good+1, u.score_good),";
        query += "score_great = IF(@score=5, u.score_great+1, u.score_great),";
        query += "score_sum =";
        query += "CASE(@score)";
        query += " WHEN 2 THEN (score_sum+2)";
        query += " WHEN 3 THEN (score_sum+3)";
        query += " WHEN 5 THEN (score_sum+5)";
        query += "END";
        query += "WHERE u.id IN ("+users+");";

        */
    }

    app.put( "/board/user/evaluation", (req,res) =>{


        for(var i in req.body.users){
            console.log( i );
        }

        //db.sequelize.query(updateUserScoreQuery( req.body.users ) )
        //.then( (result) => res.json(result) )

    }

    );




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
