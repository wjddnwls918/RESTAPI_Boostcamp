

module.exports = (app,db,sequelize) => {

    // test api 및  util api

    function getCurrentTime() {


      let currentTime = Date.now();

      //currentTime.setHours(currentTime.getHours()+9);

      return currentTime;
    }


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


    const Op = sequelize.Op


    //MyPage
    app.get("/user/info" , (req,res) => {
      db.user.findOne({

        where :{
          kakao_id : req.headers.kakao_id
        }

      }).then( result => res.json(result))
      .catch( err => res.json({ "code" : 400,
         "message" : "error, check your code"
        }))
    });



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

    function setUser(kakao_id, nick_name, sex, age, photo) {

      const query = "INSERT INTO user (kakao_id, nick_name, sex, age, photo) VALUES ("
          + kakao_id+", \""+nick_name+"\", "+sex+", "+age+", \""+photo+"\")"
          +" ON DUPLICATE KEY UPDATE kakao_id="+kakao_id+", nick_name=\""+nick_name+"\", sex ="+sex+", age ="+age+", photo =\""+photo+"\"";

      return query;
    }


    app.post( "/user", (req,res) => {

      db.sequelize.query( setUser( req.body.kakao_id, req.body.nick_name, req.body.sex, req.body.age, req.body.photo) )
      .then( () => res.json({ "code" : 200,
         "message" : "success"
        }))
      .catch( (err) => res.json({ "code" : 400,
         "message" : "error, check your code"
        }))
    });


    //Home----------------------------------------



    //score_sum 필드를 기준으로 사용자 등수를 가져옴
    function getMyRanking(kakao_id) {

      const query = "SELECT * FROM ("
                  + "SELECT    id,"
                  + "nick_name,"
                  + "score_sum,"
                  + "photo,"
                  + "@vRank := @vRank + 1 AS rank "
                  + "FROM      `user` AS p, (SELECT @vRank := 0) AS r "
                  + "ORDER BY  score_sum DESC "
                  + ") AS CNT WHERE id = (SELECT `id` FROM `user` WHERE `kakao_id` = "+kakao_id+") limit 1";


      return query;
    }

    app.get( "/home/ranking/me" , (req,res) =>

      db.sequelize.query( getMyRanking( req.headers.kakao_id) , { type: sequelize.QueryTypes.SELECT } )
      .then( (result) => res.json(result[0]))
      .catch( err =>  res.json({ "code" : 400,
         "message" : "error, check your code"
       }))

    );



    //현재 사용자 위치를 기준으로 1okm안 추천 게시글을 가져옴

    function getRecommendBoard(longitude, latitude) {

      const query = "SELECT * from board "
        //+" join user on board.writer_id = user.kakao_id "
        +" where longitude>="+(Number(longitude) - 0.05)+" and longitude<="+(Number(longitude) + 0.05)
        +" and latitude>="+(Number(latitude) - 0.05)+" and latitude<="+(Number(latitude) + 0.05)+" limit 4";

      return query;
    }

    app.get( "/home/board" , (req,res) =>{
      db.sequelize.query( getRecommendBoard(req.query.longitude, req.query.latitude) , { type: sequelize.QueryTypes.SELECT })
      .then( result => res.json(result))
      .catch( err =>  res.json({ "code" : 400,
         "message" : "error, check your code"
       }))
/*
      db.user.hasMany(db.board, {foreignKey:'writer_id'});
      db.board.belongsTo(db.user, {foreignKey: 'writer_id'});
      db.board.findAll({

        where :{
          [Op.and] : [ {longitude : {[Op.gte]: (Number(req.query.longitude) - 0.05) } },
                      {longitude : {[Op.lte]: (Number(req.query.longitude) + 0.05) } },
                      {latitude : {[Op.gte]: (Number(req.query.latitude) - 0.05) }},
                      {latitude : {[Op.lte]: (Number(req.query.latitude) + 0.05) }}
                     ]
        },
        limit : 4,
        include: [{
          model: db.user,
          //attributes : {kakao_id}
          //where: ["writer_id = kakao_id"],
          //through: {
          //  attributes: ['photo'],
            //where: {completed: true}
          //},
          required: true
        }]

      }).then( result => res.json(result))
      .catch( err =>  res.json({ "code" : 400,
         "message" : "error, check your code"
        }))
*/
  });




    //Score_sum 필드를 기준으로 상위 10명에 대한 사용자 정보(사진, 닉네임)
    app.get( "/home/ranking/user", (req,res) =>
        db.user.findAll(
        {
            attributes : ['nick_name','photo','score_sum'],
            offset: 0,
            limit: 10,
            order: [['score_sum', 'DESC']]
            ,  type: sequelize.QueryTypes.SELECT
        }).then(function(result) {
            res.json(result);
        }).catch(function(err) {
            res.send("error");
        })

       );



    //Map-----------------------------------------

    //사용자가 지정한 위치의 경도, 위도를 보내 게시글의 리스트를 가져옴

    function getCurrentPosBoard(left_longitude, left_latitude, right_longitude, right_latitude) {

        const query = "SELECT * FROM `board` WHERE `longitude` >= "+Number(left_longitude)+" AND `longitude` <= "+Number(right_longitude)
                      +" AND `latitude` >= "+Number(left_latitude)+" AND `latitude` <= "+Number(right_latitude);
        return query;
    }


    app.get( "/map/list", (req,res) =>
            db.sequelize.query( getCurrentPosBoard( req.query.left_longitude, req.query.left_latitude, req.query.right_longitude, req.query.right_latitude)
            , { type: sequelize.QueryTypes.SELECT } )
            .then( result => res.json(result) )

        );



    //Board_Preview-------------------------------
    //참가하기
    app.post( "/board/participation", (req,res) =>
    {

      db.participation.findOne({
        where : {
          user_id : req.headers.kakao_id,
          board_id : req.body.board_id
        }
      }).then( (result) => {
        //console.log(result);
        if(result === null){

          db.board.update({
             current_person : sequelize.literal('current_person + 1'),
          }, {
              where : {
                  id : req.body.board_id
              }
          }).then( (result) => {
            //res.json(result);
            //console.log("arrived1");
          });


          db.participation.create({
              user_id : req.headers.kakao_id,
              join_time : db.sequelize.NOW,
              board_id : req.body.board_id,
              isEvaluated : 0
          }).then( (result) => {
            //res.json(result);
            //console.log("arrived2");
          });
        }


        res.json({ "code" : 200,
           "message" : "success"
         } );
      }).catch( (err) => res.json({ "code" : 400,
         "message" : "error, check your code"
        }));

    });




    //Map_Search----------------------------------

    //검색어로 위치에 해당하는 게시글 검색하기
    function getSearchBoard(keyword, min_time, max_time, min_age, max_age, budget, max_person ) {

        console.log(typeof(budget));

        let transBudget;

        if(Number(budget) == 0) {
          transBudget = 99999999;
        }else {
          transBudget = budget;
        }

        const query = "SELECT * FROM `board` WHERE address like \'%"+keyword+"%\' "

        + " and appointed_time >= date_add(date(now()), INTERVAL "+min_time+" hour) and appointed_time <= date_add(date(now()), INTERVAL "+max_time+" hour)"
        + " and min_age >= "+min_age+" and max_age <= "+max_age
        + " and budget <= "+transBudget
        + " and max_person <= "+max_person+";";


        return query;


    }


    app.get( "/search/list" , (req,res) => {
        db.sequelize.query( getSearchBoard(req.query.keyword, req.query.min_time, req.query.max_time, req.query.min_age, req.query.max_age, req.query.budget, req.query.max_person)
                          , { type: sequelize.QueryTypes.SELECT } )
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


        const query = "SELECT b.id, b.address, b.title, b.appointed_time, b.current_person, b.max_person, b.write_date, b.content,"
                    + "b.latitude, b.longitude, b.budget, b.min_age, b.max_age ,"
                    + "u.nick_name, u.photo FROM board b "
                    + "LEFT JOIN user u ON b.writer_id = u.id "
                    + "LEFT JOIN token t ON u.id = t.user_id "
                    + "WHERE t.access_token LIKE "+access_token;

        return query;

    }


    app.get( "/board/list/my" , (req,res) => {

       /*  db.sequelize.query( getMyBoard( req.headers.access_token ) , { type: sequelize.QueryTypes.SELECT } )
        .then( (result) => res.json(result) )*/

        db.board.findAll({
        where: {
            writer_id : req.headers.kakao_id,
            validation : 0
        }
        ,  type: sequelize.QueryTypes.SELECT
      }).then( (result) =>{

        res.json(result);

        })
        .catch( (e) => res.send("error!"));


      });


    //사용자가 참여중인 게시글 불러오기

    function currentJoinBoard( kakao_id ) {
/*
        const query =" SELECT b.id, b.address, b.title, b.appointed_time, b.current_person, b.max_person, b.write_date, b.content,"
                    +" b.latitude, b.longitude, b.budget, b.min_age, b.max_age, u.photo, u.nick_name"
                    +" FROM board b "
                    +" LEFT JOIN participation p ON p.board_id = b.id "
                    +" LEFT JOIN user u ON b.writer_id = u.kakao_id"

                    +" WHERE t.kakao_id LIKE "+kakao_id +" AND b.writer_id != t.user_id;";

        return query;
*/

        const query ="select *"
                    +" from board as b"
                    +"  where id  in("
                    +"  select board_id from participation where user_id ="+kakao_id
                    +"  ) and  b.writer_id !="+kakao_id +";";

        return query;
    }

    app.get( "/board/list/participation/", (req,res) =>{


        db.sequelize.query( currentJoinBoard ( req.headers.kakao_id ) , { type: sequelize.QueryTypes.SELECT } )
        .then( result => {



          res.json(result);
        })



/*
      db.participation.findAll({
        attributes : ['board_id'],
        where : {
          user_id : req.headers.kakao_id
        }
      }).then( (result) => {
        res.json(result);
      })*/
});


    //Board_Add-----------------------------------

    //사용자가 작성한 게시글 등록
    app.post( "/board", (req,res) =>{

        db.board.create(
          //timezone: '+09:00',
          {
            title : req.body.title,
            address : req.body.address,
            appointed_time : req.body.appointed_time,
            restaurant_name : req.body.restaurant_name,
            max_person : req.body.max_person,
            writer_id : req.body.writer_id,
            write_date : getCurrentTime(),
            min_age : req.body.min_age,
            max_age : req.body.max_age,
            budget : req.body.budget,
            content : req.body.content,
            longitude : req.body.longitude,
            latitude : req.body.latitude,
            writer_photo : req.body.writer_photo,
            expire_date : getCurrentTime(),
            writer_name : req.body.writer_name
        }).then( () =>{

          db.board.findOne({
            attributes : ['id'],
            where : {
              writer_id : req.body.writer_id
            },
            order: [
               ['id', 'DESC']
            ]

          }).then( (board_id) => {
            console.log(JSON.stringify(board_id));
            db.participation.create({
                user_id : req.body.writer_id,
                join_time : getCurrentTime(),
                board_id : board_id.id,
                isEvaluated : 0
            }).then( (result) => {
              //res.json(result);
              //console.log("arrived2");
            });

          });

        });





          res.json({ "code" : 200,
             "message" : "success"
           });

      });


    //Board_Detail--------------------------------

    //게시글에 달린 댓글 불러오기
    app.get( "/board/comment/:board_id", (req,res) =>
        db.comment.findAll({
        where: {
            board_id : req.params.board_id
        }

        }).then( (result) => res.json(result) )
        );


    //User_Evaluation-----------------------------


    function updateUserScoreQuery(user) {

        const query =  "SET @score=2;";
                    + " UPDATE USER u";
                    + " SET";

                    + "score_normal = IF(@score=2, u.score_normal+1, u.score_normal),";
                    + " score_good = IF(@score=3, u.score_good+1, u.score_good),";
                    + " score_great = IF(@score=5, u.score_great+1, u.score_great),";
                    + " score_sum =";
                    + " CASE(@score)";
                    + " WHEN 2 THEN (score_sum+2)";
                    + " WHEN 3 THEN (score_sum+3)";
                    + " WHEN 5 THEN (score_sum+5)";
                    + " END";
                    + " WHERE u.id IN ("+users+");";

                    return query;
    }

    app.put( "/board/user/evaluation", (req,res) =>{

      let users = req.body.users;

      for(user in users) {
        db.sequelize.query( updateUserScoreQuery ( user ) )
        .then( result => res.json(result))
        .catch(function(err) {
            res.send("error");
        })


      }


    });




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
