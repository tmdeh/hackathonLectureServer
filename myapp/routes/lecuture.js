var express = require('express');
var router = express.Router();
const db = require('../model/db');

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
                    proposEndDate : result[i].proposal,
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

router.post('/', function(req, res, next) {

});

router.get('/:lectureId', function(req, res, next) {

});

router.get('/:userId', function(req, res, next) {

});

router.post('/search', function(req, res, next) {

});

router.post('/proposal', function(req, res, next) {

});

router.delete('/proposal/cancel' , (req, res, next) => {

})



module.exports = router;
