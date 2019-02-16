//Model definition
/**
* @swagger
*definitions:
*  board:
*    type: object
*    properties:
*      id:
*        type: int(11)
*      address:
*        type: varchar(50)
*      title:
*        type: varchar(50)
*      appointed_time:
*        type: datetime
*      max_person:
*        type: int(11)
*      current_person:
*        type: int(11)
*      restaurant_name:
*        type: varchar(50)
*      writer_id:
*        type: int(11)
*      write_date:
*        type: datetime
*      validation:
*        type: int(11)
*      content:
*        type: text
*      expire_date:
*        type: datetime
*      longitude:
*        type: double
*      latitude:
*        type: double
*      budget:
*        type: int(11)
*      min_age:
*        type: int(11)
*      max_age:
*        type: int(11)
*  comment:
*    type: object
*    properties:
*      id:
*        type: int(11)
*      writer_id:
*        type: int(11)
*      board_id:
*        type: int(11)
*      write_time:
*        type: datetime
*      content:
*        type: text
*  participation:
*    type: object
*    properties:
*      id:
*        type: int(11)
*      user_id:
*        type: int(11)
*      join_time:
*        type: datetime
*      board_id:
*        type: int(11)
*      isEvaluated:
*        type: tinyint(1)
*  user:
*    type: object
*    properties:
*      id:
*        type: int(11)
*      nick_name:
*        type: varchar(50)
*      age:
*        type: int(11)
*      sex:
*        type: int
*      photo:
*        type: varchar(50)
*      join_date:
*        type: datetime
*      score_normal:
*        type: int(11)
*      score_good:
*        type: int(11)
*      score_great:
*        type: int(11)
*      score_sum:
*        type: int(11)
*      kakao_id:
*        type: bigint(20)
*    xml:
*      name: board
*/

  Category:
    type: object
    properties:
      id:
        type: integer
        format: int64
      name:
        type: string
    xml:
      name: Category
  User:
    type: object
    properties:
      id:
        type: integer
        format: int64
      username:
        type: string
      firstName:
        type: string
      lastName:
        type: string
      email:
        type: string
      password:
        type: string
      phone:
        type: string
      userStatus:
        type: integer
        format: int32
        description: User Status
    xml:
      name: User
  Tag:
    type: object
    properties:
      id:
        type: integer
        format: int64
      name:
        type: string
    xml:
      name: Tag
  Pet:
    type: object
    required:
      - name
      - photoUrls
    properties:
      id:
        type: integer
        format: int64
      category:
        $ref: '#/definitions/Category'
      name:
        type: string
        example: doggie
      photoUrls:
        type: array
        xml:
          name: photoUrl
          wrapped: true
        items:
          type: string
      tags:
        type: array
        xml:
          name: tag
          wrapped: true
        items:
          $ref: '#/definitions/Tag'
      status:
        type: string
        description: pet status in the store
        enum:
          - available
          - pending
          - sold
    xml:
      name: Pet
  ApiResponse:
    type: object
    properties:
      code:
        type: integer
        format: int32
      type:
        type: string
      message:
        type: string


//API definition
/**
* @swagger
* /board:
*   get:
*     description: to get lsit of board from DB
*     produces:
*       - application/json
*     responses:
*       '200':
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 id:
*                   type: integer
*                   format: int64
*                   example: 1
*       default:
*         description: Unexpected error
*/
