

module.exports = (app,db,sequelize,fcm) => {

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

    app.get( "/fcmtoken", (req,res) =>
        db.fcmtoken.findAll().then( (result) => res.json(result) )
        );

    app.get( "/user", (req,res) =>
        db.user.findAll().then( (result) => res.json(result) )
        );

    app.get( "/participation", (req,res) =>{
        db.participation.findAll().then( (result) => res.json(result));

      });


    //--------------------------------------------
    /*
    project api
    boostcamp team d

    */


    const Op = sequelize.Op


 /* 1 */
    function getTodayBoard() {

      const query = "select * from board "
      + " where DATE(write_date) = DATE(NOW());"

      return query;
    }

    app.get("/board/today", (req,res) => {

      db.sequelize.query( getTodayBoard( ) ,  { type: sequelize.QueryTypes.SELECT } )
      .then( (result) => res.json(result) )
      .catch( (err) => res.json({ "code" : 400,
         "message" : "error, check your code"
        }))

    })

 /* 2 */
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



 /* 3 */
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



 /* 4 */
    //카카오 로그인 시 유저 정보 서버 저장
    //이거 기존 사용자가 로그인 다시하면 안들어가게 해야됨

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



 /* 5 */
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



/* 6 */
    //현재 사용자 위치를 기준으로 1okm안 추천 게시글을 가져옴
    function getRecommendBoard(longitude, latitude) {

      const query = "SELECT * from board "
        //+" join user on board.writer_id = user.kakao_id "
        +" where longitude>="+(Number(longitude) - 0.05)+" and longitude<="+(Number(longitude) + 0.05)
        +" and latitude>="+(Number(latitude) - 0.05)+" and latitude<="+(Number(latitude) + 0.05)
        //+ " and write_date >= now() - INTERVAL 1 DAY"
        + " and DATE(write_date) = DATE(NOW())"
        +" limit 4";

      return query;
    }

    app.get( "/home/board" , (req,res) =>{
      db.sequelize.query( getRecommendBoard(req.query.longitude, req.query.latitude) , { type: sequelize.QueryTypes.SELECT })
      .then( result => res.json(result))
      .catch( err =>  res.json({ "code" : 400,
         "message" : "error, check your code"
       }))

  });




/* 7 */
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


    /* 8 */
    //사용자가 지정한 위치의 경도, 위도를 보내 게시글의 리스트를 가져옴
    function getCurrentPosBoard(left_longitude, left_latitude, right_longitude, right_latitude) {

        const query = "SELECT * FROM `board` WHERE (`longitude` >= "+Number(left_longitude)+" AND `longitude` <= "+Number(right_longitude)
                      +" AND `latitude` >= "+Number(left_latitude)+" AND `latitude` <= "+Number(right_latitude)+")"
                      //+ " and write_date >= now() - INTERVAL 1 DAY";
                      + " and DATE(write_date) = DATE(NOW())"
                      +";";
        return query;
    }


    app.get( "/map/list", (req,res) =>
            db.sequelize.query( getCurrentPosBoard( req.query.left_longitude, req.query.left_latitude, req.query.right_longitude, req.query.right_latitude)
            , { type: sequelize.QueryTypes.SELECT } )
            .then( result => res.json(result) )

        );



    //Board_Preview-------------------------------

    /* 9 */
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

    /* 10 */
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
        //+ " and DATE(write_date) = DATE(NOW())"
        + " and (appointed_time >= date_add(date(now()), INTERVAL "+min_time+" hour) and appointed_time <= date_add(date(now()), INTERVAL "+max_time+" hour)"
        + " and min_age >= "+min_age+" and max_age <= "+max_age
        + " and budget <= "+transBudget
        + " and max_person <= "+max_person +")"
        //+ " and write_date >= now() - INTERVAL 1 DAY"
        +";";


        return query;


    }


    app.get( "/search/list" , (req,res) => {
        db.sequelize.query( getSearchBoard(req.query.keyword, req.query.min_time, req.query.max_time, req.query.min_age, req.query.max_age, req.query.budget, req.query.max_person)
                          , { type: sequelize.QueryTypes.SELECT } )
        .then( (result) => res.json(result) )

        }

     );


    //Board_List----------------------------------

    /* 11 */
    //사용자가 생성한 게시글 불러오기
    function getMyBoard( kakao_id ) {


        const query = "SELECT * from board "
                    + " WHERE writer_id ="+kakao_id
                    + " and validation = 0"
                    + " and DATE(write_date) = DATE(NOW())"
                    //+ " and DATE(write_date) = CURDATE()"
                    //+ " and write_date >= now() - INTERVAL 1 DAY"
                    + " order by id desc;";

        return query;

    }


    app.get( "/board/list/my" , (req,res) => {

         db.sequelize.query( getMyBoard( req.headers.kakao_id ) , { type: sequelize.QueryTypes.SELECT } )
        .then( (result) => res.json(result) )

      });


    //사용자가 참여중인 게시글 불러오기
    /* 12 */
    function currentJoinBoard( kakao_id ) {

        const query ="select *"
                    +" from board as b"
                    +"  where id  in("
                    +"  select board_id from participation where user_id ="+kakao_id
                    +"  ) and  b.writer_id !="+kakao_id
                    + " and DATE(write_date) = DATE(NOW())"
                    //+ " and write_date >= now() - INTERVAL 1 DAY"
                    +" order by id desc;";

        return query;
    }

    app.get( "/board/list/participation/", (req,res) =>{


        db.sequelize.query( currentJoinBoard ( req.headers.kakao_id ) , { type: sequelize.QueryTypes.SELECT } )
        .then( result => {



          res.json(result);
        })


});


    /* 13 */
    //Board_Add-----------------------------------

    //사용자가 작성한 게시글 등록
    //게시글 작성
    app.post( "/board", (req,res) =>{

        db.board.create(
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

            });


            //구독 설정

            let token = req.headers.token;

            fcm.subscribeToTopic([ token ], String(board_id.id), (err, res) => {
              if( err) {
                console.log(err);
              }else {
                console.log(res);
              }

            });


          });

        });



          res.json({ "code" : 200,
             "message" : "success"
           });

      });


    //Board_Detail--------------------------------

    /* 14 */


    //게시글에 달린 댓글 불러오기
    //board_id, comment
    function getBoardComment(kakao_id, board_id) {

      const query = " SELECT c.*, u.nick_name "
      + " FROM comment c "
      + " LEFT JOIN user u ON u.kakao_id = c.kakao_id "
      + " WHERE c.board_id ="+ board_id


      return query;
    }

    app.get( "/board/comment/", (req,res) =>{

      db.sequelize.query(getBoardComment(req.headers.kakao_id, req.query.board_id) , { type: sequelize.QueryTypes.SELECT })

      .then( (result) => res.json(result) )
    });


    /* 15 */
    //댓글 작성

  function getTopicMessage(topic) {
    let commentAddMessage = {
      to : "/topics/"+topic,
        "data": {
    		"title": "제목입니다",
    		"message": "내용입니다"
    	},
      notification: {
        title: 'test message',
        body: 'hello Nodejs'
      }


    };
    return commentAddMessage;
  }

    app.post( "/board/comment", (req,res) => {



        db.comment.create( {

          kakao_id : req.headers.kakao_id,
          board_id : req.body.board_id,
          write_time : getCurrentTime(),
          content : req.body.content


        }).then( ()=> {

          //구독 등록

          let token = req.headers.token;

          fcm.subscribeToTopic([ token ], String(req.body.board_id), (err, res) => {
            if( err) {
              console.log(err);
            }else {
              console.log(res);
            }

          });

          //메시지 보내기

          var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)

                  to: "/topics/"+String(req.body.board_id),

                  notification: {
                      title: "댓글을 확인해 주세요",
                      body: req.body.content,
                      sound:"default"
                  },
                  data: {  //you can send only notification or only data(or include both)
                      board_id: req.body.board_id,
                  }
              };

              fcm.send(message, function(err, response){
                  if (err) {
                      console.log("Something has gone wrong!");
                  } else {
                      console.log("Successfully sent with response: ", response);
                  }
              });


          res.json({ "code" : 200,
             "message" : "success"
           });


        }).catch( (err) => res.json({ "code" : 400,
           "message" : "error, check your code"
         }));


    })


    /* 16 */
    //Board_Evaluation-----------------------------
    //게시글 평가

    function updateBoardrScoreQuery(writer_id, board_id, score) {

        const query =  " UPDATE user"
                    + " SET"
                    + " score_normal = IF(" + score + "=2, score_normal+1, score_normal),"
                    + " score_good = IF(" + score + "=3, score_good+1, score_good),"
                    + " score_great = IF(" + score + "=5, score_great+1, score_great),"
                    + " score_sum = score_sum + " + score
                    + " WHERE kakao_id ="+writer_id+";";
                    return query;
    }

    app.put( "/mypage/judge", (req,res) =>{

      let users = req.headers.kakao_id;

      console.log(users);

        db.sequelize.query( updateBoardrScoreQuery ( req.body.writer_id, req.body.board_id, req.body.score ) )
        .then( result =>{
          // res.json(result)


            db.participation.update(
              { isEvaluated : true  },
              { where : {
                user_id : req.headers.kakao_id,
                board_id : req.body.board_id
              }}
            ).then( () => {

              //구독해제

              let token = req.headers.token;

              fcm.unsubscribeToTopic([ token ], String(req.body.board_id), (err, res) => {
                if( err) {
                  console.log(err);
                }else {
                  console.log(res);
                }
              });

              res.json({ "code" : 200,
                 "message" : "success"
               });
            });


        })
        .catch(function(err) {
            res.send("error");
        })


    });




    /* 17 */
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



    /* 18 */
   //방 평가 ( 유저, 방 id, 점수)
/*
   function boardEvaluation(kakao_id,) {

     let query = "update "
     + "(SELECT `board_id` FROM `participation` "
     + "  WHERE user_id ="+ kakao_id +" and isEvaluated=0) and `writer_id` != "+kakao_id+";";

     return query;
   }


   app.post( "/board/evaluation" , (req,res) => {




     db.sequelize.query( boardEvaluation ( req.headers.kakao_id )  )
     .then( ()=> {
       res.json({ "code" : 200,
          "message" : "success"
        });
     }).catch( (err) => res.json({ "code" : 400,
        "message" : "error, check your code"
      }));

      //구독 해제
      let token = req.headers.token;

      fcm.unsubscribeToTopic([ token ], String(req.body.board_id), (err, res) => {
        if( err) {
          console.log(err);
        }else {
          console.log(res);
        }


   })

*/


    /* 19 */
   //평가 방정보 얻어오기

   function getBoardToEvaluation(kakao_id) {

     const query = "select * from `board` where `id` in (SELECT board_id FROM `participation`"
                 + " WHERE user_id = "+kakao_id+" and isEvaluated = 0 "
                 +" and join_time <= DATE_SUB(now(), INTERVAL 1 DAY)"
                 +" ) and `writer_id` !="+ kakao_id
                // + " and appointed_time <= DATE_SUB(now(), INTERVAL 1 DAY);"
                 +";";

     return query;
   }

   app.get( "/mypage/judge" , (req,res) => {

     db.sequelize.query( getBoardToEvaluation ( req.headers.kakao_id )  , { type: sequelize.QueryTypes.SELECT } )
     .then( result => {
       res.json(result);
     })


   })


   /* 20 */
   //FCM 토큰 넣기

   app.post("/fcm/token", (req,res) => {

     db.fcmtoken.create({
       token : req.headers.token
     }).then( (result)=> {
       res.json(result)
     }).catch( (err) => res.json({ "code" : 400,
        "message" : "error, check your code"
      }));

   })



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
