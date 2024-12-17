const multer = require('multer');

const createMulter = (uploadPath) => {

    //multer 설정
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            // 원본 파일명에서 공백을 하이픈으로 대체
            const sanitizedFilename = file.originalname.replace(/\s+/g, '-');
            // const encodedFilename = encodeURIComponent(sanitizedFilename);
            const fileName = `${Date.now()}-${sanitizedFilename}`;
            cb(null,Buffer.from(fileName).toString('utf8'));
        }
    });

    //파일 필터링
    const fileFilter = (req,file,cb) => {
        if(file.mimetype.startsWith('image/')){
            cb(null, true);
        }else{
            cb(new Error('지원하지 않는 파일 형식입니다.'), false);
        }
    };

    return multer({
        storage: storage,
        fileFilter:fileFilter,
        limits: {
            fileSize: 1024 * 1024 * 5, //5MB
        }
    })
}

// 게시글 업로드
const postsUpload = createMulter('server/data/images');

// 프로필 업로드
const profileUpload = createMulter('server/data/images/profile');

module.exports = {postsUpload, profileUpload};
