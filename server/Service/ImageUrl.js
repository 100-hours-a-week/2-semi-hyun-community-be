import dotenv from 'dotenv';

dotenv.config({ path: 'server/config/.env' });

const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

// 게시글 이미지 URL 반환
export const getImageUrl = (fileName) => {
    return `${CLOUDFRONT_URL}/${fileName}`;
};
