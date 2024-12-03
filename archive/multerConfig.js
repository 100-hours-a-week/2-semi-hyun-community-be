const multer = require('multer');

//multer 저장소설정
const storage = multer.diskStorage({
    destination : function (req,file,cb){ 
        // NOTE: req:HTTP 요청객체, file:업로드된 파일객체, cb:콜백함수
        cb(null, 'community/images'); //에러처리용,저장경로
    },
    filename: function (req,file,cb){
        // 한글 파일명을 URL 인코딩하여 저장
        const encodedFilename = encodeURIComponent(file.originalname);
        cb(null, Date.now() + '-' + encodedFilename);
    }
    
});

//파일 필터링 - 이미지 파일만 허용
const fileFilter= (req,file,cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('지원하지 않는 파일 형식입니다.'), false);
    }
};

//multer 인스턴스 생성
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits : {
        fileSize: 1024 * 1024 * 5, //5MB
    }
});

//NOTE : {upload}를 사용하면 객체 형태로 내보낸다.
//NOTE : upload.single로 사용하려면 인스턴스로 내보내야한다.
module.exports = upload;

