var express = require('express');
var router = express.Router();
const db = require('../model/db');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/fileload');
const secret = require('../secret/primary');

/* GET users listing. */
router.get('/', function(req, res, next) { //모집중 0 진행중 1 종료됨 2
    //현제 > 모집 종료 && 현제 > 특강종료 = 진행중
    //현제 < 특강 시작 && 현제 < 모집 종료 = 모집중
    //현제 > 특강 시작 && 현제 > 특강 종료 = 종료됨
    let now = new Date();
    let resData = [];
    db.query('SELECT * FROM Lecture ORDER BY upload_date desc', (err, result) => {
        if(err || Object.keys(result).length == 0){
            res.status(404).json({
                data : null,
                message : "게시물 가져오기에 실패했습니다.",
            })
        }
        else {
            for(let i = 0; result[i] !== undefined; i++){
                let field = JSON.parse(result[0].field);
                let state  =  -1;
                if(now < result[i].proposal){//모집 중
                    state = 0;
                }
                if (now >= result[i].start_date){//모집 종료 진행중
                    state = 1;
                }
                if(now > result[i].end_date){//종료됨
                    state = 2;
                }
                let data = {
                    lectureId : result[i].lecture_id,
                    title : result[i].title,
                    content : result[i].content,
                    attachment_url : result[i].attachment_url,
                    field: field,
                    startDate : result[i].start_date,
                    endDate : result[i].end_date,
                    uploadDate : result[i].upload_date,
                    proposal : result[i].proposal,
                    state : state,
                }
                resData.push(data);
            }
             res.status(200).json({
                data : resData,
                message : "게시물 가져오기를 성공하였습니다.",
            })
        }
        
    })
});

router.post('/', upload.array('attachment', 4), function(req, res, next) {
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
  const insetQuery = (data) => {
      let post = req.body;
      let files = req.files;
      let filesString = "";
      for(var i=0;i<files.length;i++){
        filesString += files[i].path;
        if(i!=files.length-1){
            filesString+=",";
        }
      }
      const promise = new Promise((resolve, reject) => {
        db.query('INSERT INTO Lecture(title, content, attachment_url, user_id, field, start_date, end_date, proposal) Values(?, ?, ?, ?, ?, ?, ?, ?)', 
            [post.title, post.content, filesString,  data.userId, post.field, post.start_date, post.end_date, post.proposal], (err, result) => {
                console.log(err);
                if(err){
                    reject(err);
                }
                else{
                    resolve();
                }
            })
      })
      return promise;
  }
    const response = () => {
        res.status(201).json({
          data : null,
          message : "게시물 등록에 성공하였습니다.",
        })
    }

    const err = (error) => {
        console.log(error);
        res.status(400).json({
            data : null, 
            message : "게시물 등록에 실패하였습니다.",
        })
    }
  tokendecode()
  .then(insetQuery)
  .then(response)
  .catch(err)
});

router.get('/:lectureId', function(req, res, next) {
    let now = new Date();
    let lectureId = req.params.lectureId;
    db.query("select * from Lecture where lecture_id = ?", [lectureId], (err, result) => {
        if(result == undefined || err || Object.keys(result).length == 0){
            res.status(404).json({
                data : null,
                message : "게시물이 존재하지 않습니다."
            })
        }
        else{
            let url = result[0].attachment_url.split(',');
            let field = JSON.parse(result[0].field);
            let state  =  -1;
            if(now < result[0].proposal){//모집 중
                state = 0;
            }
            if (now >= result[0].start_date){//모집 종료 진행중
                state = 1;
            }
            if(now > result[0].end_date){//종료됨
                state = 2;
            }
            let data = {
                lecture_id : result[0].lecture_id,
                title : result[0].title,
                content : result[0].content,
                attachmentUrl : url,
                userId : result[0].user_id,
                field : field,
                startDate : result[0].start_date,
                endDate : result[0].end_date,
                uploadDate : result[0].upload_date,
                proposal : result[0].proposal,
                state : state,
            }
            res.status(200).json({
                data : data,
                message : "게시물 가져오기에 성공하였습니다.",
            })
        }
    })
});

router.get('/user/:userId', function(req, res, next) {
    let now = new Date();
    let userId = req.params.userId;
    db.query('SELECT * FROM Lecture WHERE user_id = ?', [userId], (err, result) => {
        if(result == undefined || err || Object.keys(result).length == 0){
            res.status(404).json({
                data : null,
                message : "게시물이 존재하지 않습니다."
            })
        }
        else{
            let resData = [];
            for(let i = 0; i < result.length; i++){
                let url = result[i].attachment_url.split(',');
                let field = JSON.parse(result[i].field);
                let state  =  -1;
                if(now < result[i].proposal){//모집 중
                    state = 0;
                }
                if (now >= result[i].start_date){//모집 종료 진행중
                    state = 1;
                }
                if(now > result[i].end_date){//종료됨
                    state = 2;
                }
                let data = {
                    lecture_id : result[0].lecture_id,
                    title : result[0].title,
                    content : result[0].content,
                    attachmentUrl : url,
                    userId : result[0].user_id,
                    field : field,
                    startDate : result[0].start_date,
                    endDate : result[0].end_date,
                    uploadDate : result[0].upload_date,
                    proposal : result[0].proposal,
                    state : state,
                }
                resData.push(data);
            }
            res.status(200).json({
                data : resData,
                message : "게시물 가져오기를 성공하였습니다."
            })
        }
    })
});

router.post('/search', function(req, res, next) {

});

router.post('/proposal', function(req, res, next) {

});

router.delete('/proposal/cancel' , (req, res, next) => {

})



module.exports = router;
