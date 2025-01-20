import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname,'../'); //NOTE: 절대경로로 해석 -> 상위 디렉토리로 이동

//프로필 이미지 삭제
export const deleteProfileImage = async (profile_image) => {
    const imagePath = path.join(rootDir,'data/images/profile/',profile_image);
    try{
        await fs.promises.unlink(imagePath);
    }catch(error){
        console.error('Error deleting image:', error);
        throw error;
    }
};

//게시글 이미지 삭제
export const deletePostImage = async (post_image) => {
    if(!post_image) return;
    const imagePath = path.join(rootDir,'data/images/',post_image);
    try{
        await fs.promises.unlink(imagePath);
    }catch(error){
        console.error('Error deleting image:', error);
        throw error;
    }
};

