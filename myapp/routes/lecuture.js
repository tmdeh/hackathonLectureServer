var express = require('express');
var router = express.Router();
const db = require('../model/db');

/* GET users listing. */
router.get('/', function(req, res, next) { //모집중 0 진행중 1 종료됨 2
    //현제 > 모집 종료 && 현제 > 특강종료 = 진행중
    //현제 < 특강 시작 && 현제 < 모집 종료 = 모집중
    //현제 > 특강 시작 && 현제 > 특강 종료 = 종료됨
    let now = new Date();
    console.log(now);
    db.query('SELECT * FROM Lecture', (err, result) => {
        let field = JSON.parse(result[0].field);
        let state = -1;
        if(now < result[0].proposal){//모집 중
            state = 0;
        }
        else if (now < result[0].end_date && now > result[0].start_date){//모집 종료 진행중
            satte = 1;
        }
        else if(now > result[0].start_date && now > result[0].end_date){//종료됨
            state = 2;
        }
        let data = {
            lectureId : result[0].lecture_id,
            title : result[0].title,
            content : result[0].content,
            attachment_url : result[0].attachment_url,
            field: field,
            startDate : result[0].start_date,
            endDate : result[0].end_date,
            uploadDate : result[0].upload_date,
            proposEndDate : result[0].proposal,
            state : state,
        }
        console.log(data);
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
