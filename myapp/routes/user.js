var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const secret = require('../secret/primary');
const db = require("../model/db");
const crypto = require('crypto');
const upload = require('../middleware/fileload');

/* GET home page. */
router.post('/signUp', upload.single('profile'), function(req, res, next) {
  const dbQuery = () => {
    let profile = null;
    post = req.body;
    if(req.file != undefined){
      profile = req.file.filename;
    }
    var pw = crypto.createHash('sha512').update(post.password).digest('base64');
    const promise = new Promise((resolve, reject) => {
      db.query(`INSERT INTO user (user_id, password, name, grade, class, number, field, attachment_url, introduce) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [post.userId, pw, post.name, post.grade, post.klass, post.number, post.field, profile, post.introduce],
        (err, result) => {
          if (err){
            reject(err)
          }
          else {
            db.end();
            var user = {
              userId : post.userId,
              password : pw,
            };
            var token = jwt.sign(user, secret, {
              expiresIn: "24H"
            })
            resolve(token);
          }
        })
    })
    return promise;
  }

  const err = (error) => {
    if(error.code == 'ER_BAD_NULL_ERROR')
    {
      res.status(401).json({
        data : null,
        message : "회원가입에 실패하였습니다. 기입된 값을 확인해 주세요.",
      })
    }
    else if(error.code == 'ER_DUP_ENTRY'){
      res.sendStatus(409);
    }
    else {
      res.sendStatus(401);
    }
  }

  const response = (token) => {
    res.status(200).json({
      data : {
        token : token
      },
      message : "회원가입에 성공하였습니다.",
    })
  }

  dbQuery()
  .then(response)
  .catch(err)

});

router.post('/login', function(req, res, next) {
  let post = req.body;
  const pw = crypto.createHash('sha512').update(post.password).digest('base64'); //암호화된 리퀘스트 패스워드
  db.query(`select password from User where user_id=?`, [post.userId], (err, result) => {
    if (!Object.keys(result)) {
      res.status(401).json({
        data : null,
        message : "사용자를 찾을 수 없습니다."
      });
      return;
    }
    if (pw == result[0].password) {
      var user = {
        userId: post.userId,
        password: pw,
      };
      var token = jwt.sign(user, secret, {
        expiresIn: "24H"
      })
      res.status(200).json({
        data : {
          token : token
        },
        message : "로그인에 성공하였습니다.",
      });
    }
    else {
      res.status(401).json({
        data : null,
        message: "로그인에 실패하였습니다."
      });
    }
  })
});

router.post('/autoLogin', function(req, res, next) {
  const token = req.get('authorization');
  const tokendecode = () => {
    const promise = new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      })
    })
    return promise;
  }

  const dbsearch = (data) => {
    const promise = new Promise((resolve, reject) => {
      db.query('SELECT user_id FROM User WHERE user_id=?', [data.userId], (err, result) => {
        if (err) {
          reject(err);
        }
        if (result[0] === undefined) resolve(false);
        else resolve(true);
      })
    })
    return promise
  };
  const respond = (result) => {
    if (result) {
      res.status(200).json({
        data : {
          token : token
        },
      });
    } else {
      res.sendStatus(403);
    }
  }

  const error = (error) => {
    if(error.message == 'jwt expired'){
      res.status(401).json({
        data : null,
        message : "토큰이 만료되었습니다.",
      });
    }
    else{
      res.sendStatus(403);
    }
  }

  tokendecode()
  .then(dbsearch)
  .then(respond)
  .catch(error);

});

router.get('/', function(req, res, next) {
  const token = req.get('authorization');
  const tokendecode = () => {
    const promise = new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      })
    })
    return promise;
  }

  const dbsearch = (data) => {
    const promise = new Promise((resolve, reject) => {
      db.query('SELECT user_id, name, grade, class, number, field, attachment_url from User where user_id = ?', [data.userId], (err, result) => {
        if(err){
          reject(err);
        }
        if(result[0] == undefined) resolve (data = null)
        field = JSON.parse(result[0].field);
        let data = {
          userId : result[0].user_id,
          name : result[0].name,
          grade : result[0].grade,
          klass : result[0].class,
          number : result[0].number,
          field : field,
          attachment_url : result[0].attachment_url,
          introduce : result[0].introduce,
        }
        resolve(data);
      })
    })
    return promise;
  }

  const err = (error) => {
    if(error.message == 'jwt expired'){
      res.status(401).json({
        data : null,
        message : "토큰이 만료되었습니다.",
      });
    }
    else {
      res.sendStatus(404);
    }
  };

  const response = (data) => {
    if(data){
      res.status(200).json({
        data : data,
        message : "데이터를 정상적으로 가져왔습니다."
      })
    }
    else {
      res.sendStatus(404);
    }
  };
  tokendecode()
  .then(dbsearch)
  .then(response)
  .catch(err);
});

router.put('/', upload.single('updateProfile'), function(req, res, next) {
  let token = req.get('authorization');
  const tokendecode = () => {
    const promise = new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, data) => {
        if (err) reject(err);
        else {
          resolve(data);
        }
      })
    })
    return promise;
  }
  const dbQuery = (data) => {
    const profile = crypto.createHash('sha512').update(req.file.filename).digest('base64');
    const pw = crypto.createHash('sha512').update(req.body.password).digest('base64');
    const promise = new Promise((resolve, reject) => {
      db.query("UPDATE User SET user_id = ?, password = ?,name = ?, grade = ?, class = ?, number = ?, field = ?, attachment_url = ?, introduce = ? WHERE user_id = ?", 
      [req.body.userId, pw, req.body.name, req.body.grade, req.body.klass, req.body.number, req.body.field, profile, req.body.introduce, data.userId],
      (err, result) => {
        if(err) reject(err);
        else{      
          resolve(true);
        }
      })
    })
    return promise;
  }
  const response  = (success) => {
    res.status(200).json({
      data : null,
      message : "수정에 성공했습니다.",
    })
  }

  const err = (error) => {
    if(error.code == 'ER_DUP_ENTRY'){
      res.status(409).json({
        data : null,
        message : "아이디가 중복되었습니다.",
      });
    }
    else if (error.code == 'ER_BAD_NULL_ERROR'){
      res.status(400).json({
        data : null,
        message : "사용자의 모든 데이터를 주세요."
      })
    }
    else{
      res.status(400).json({
        data : null,
        message : "수정에 실패했습니다.",
      })
    }
  }

  tokendecode()
  .then(dbQuery)
  .then(response)
  .catch(err)
});

module.exports = router;