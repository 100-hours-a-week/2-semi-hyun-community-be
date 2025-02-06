import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import s3 from './S3Client.js';


dotenv.config({ path: 'server/config/.env' });


//S3 객체 삭제 함수
const deleteFromS3 = async (FileKey) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: FileKey
    });
    try{
        await s3.send(command);
        console.log(`Successfully deleted ${FileKey} from S3`);
    }catch(error){
        throw error;
    }
};

// 프로필 이미지 삭제
export const deleteProfileImage = async (profile_image) => {
    if (!profile_image) return;
    await deleteFromS3(profile_image);
};


// 게시글 이미지 삭제
export const deletePostImage = async (post_image) => {
    if (!post_image) return;
    await deleteFromS3(post_image);
};

