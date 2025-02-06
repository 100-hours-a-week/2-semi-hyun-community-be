import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from './S3Client.js';
import dotenv from 'dotenv';


dotenv.config({ path: 'server/config/.env' });

const createMulter = (bucketFolder) => {
    return multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.S3_BUCKET_NAME,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            acl: 'public-read', // CloudFront에서 접근 가능하도록 설정
            key: (req, file, cb) => {
                const sanitizedFilename = file.originalname.replace(/\s+/g, '-');
                const fileName = `${Date.now()}-${sanitizedFilename}`;
                cb(null, `${bucketFolder}/${fileName}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('지원하지 않는 파일 형식입니다.'), false);
            }
        },
        limits: { fileSize: 1024 * 1024 * 5 } // 5MB 제한
    });
};

// 게시글 업로드
const postsUpload = createMulter('images/posts');
// 프로필 업로드
const profileUpload = createMulter('images/profiles');

export { postsUpload, profileUpload };
