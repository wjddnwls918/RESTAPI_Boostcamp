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
*    xml:
*      name: board
*
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
*     parameters:
*       - name: username
*         description: Username to use for login.
*         in: formData
*         required: true
*         type: string
*       - name: password
*         description: User's password.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: board
*/
