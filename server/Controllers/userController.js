import bcrypt from 'bcrypt';
import {deleteProfileImage} from '../Service/ImageHandler.js';
import UserModel from '../Models/UserModel.js';
import PostService from '../Service/PostService.js';

const userController = {
    //이미지 조회
    getImageById: async (user_id) => {
        const user = await UserModel.getUserById(user_id);
        return user && user.profile_image ? user.profile_image : '';
    },

    //게시글 목록 조회: 프로필 이미지 조회
    getProfileImage: async(req,res) => {
        try {
            const image = await userController.getImageById(req.params.user_id);
            return res.status(200).json({ image });
        } catch (error) {
            return res.status(500).json({ message: '이미지를 가져오는 중 오류가 발생했습니다.' });
        }
    },

    //프로필 이미지 조회
    getHeaderImage: async(req,res) => {
        try {
            const image = await userController.getImageById(req.session.user.user_id);
            return res.status(200).json({ image });
        } catch (error) {
            console.error('프로필 이미지 조회 오류:',error);
            return res.status(500).json({ message: '이미지를 가져오는 중 오류가 발생했습니다.' });
        }
    },

    // 회원정보 수정(닉네임,사진): 데이터 조회
    getEditUserData: async(req,res) => {
        try{   
            const { user_id } = req.session.user;
            const user = await UserModel.getUserById(user_id);

            if(!user){
                return res.status(404).json({message:'회원정보가 없습니다.'});
            }

            return res.status(200).json({
                //NOTE : MYSQL 쿼리 결과가 JS 객체로 자동 변환
                data: { name: user.name, email: user.email, image:user.profile_image},
                message: 'get user data success'
            });
        } catch(error){
            console.error('사용자 정보 조회 중 오류 발생:', error);
            return res.status(500).json({message: '서버 오류가 발생했습니다.'});
        }
    },

    //회원정보 수정 : 닉네임,사진
    patchUserInfo: async(req,res) => {
        const { user_id } = req.session.user; //user_id from session
        const { name} = req.body;
        console.log('req.file:',req.file)

        try{
            //사진이 있을 경우
            if(req.file){
                // 기존 프로필 삭제
                const user = await UserModel.getUserById(user_id);
                await deleteProfileImage(user.profile_image);
            }

            //유저 정보 수정
            const updated = await UserModel.patchUser(user_id,{
                name,
                image : req.file ? req.file.filename : undefined
            });

            if(!updated){
                return res.status(404).json({message:'user_not_found'});
            }

            // 세션의 사용자 정보 업데이트
            req.session.user = {
                ...req.session.user,
                name
            };
                    
            // 세션 저장을 기다림
            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if(err) reject(err);
                    else resolve();
                });
            });

            return res.status(200).json({message: 'User information updated successfully'});

        }catch(error){
            console.error('사용자 정보 조회 중 오류 발생:', error);
            return res.status(500).json({message: '서버 오류가 발생했습니다.'});
        }
    },

    //회원정보 수정 : 패스워드
    patchPassword: async(req,res) => {
        const { user_id } = req.session.user; //user_id from session
        const { password } = req.body;

        try{
            if(!password){
                return res.status(400).json({message:'password_required'});
            }

            //비밀번호 해싱
            const hashedPassword = await bcrypt.hash(password,10);

            //유저 정보 수정
            const user = await UserModel.patchPassword(user_id,hashedPassword);

            if(!user){
                return res.status(404).json({message:'user_not_found'});
            }

            return res.status(200).json({message: 'patch_userinfo_successful'});

        }catch(error){
            console.error('사용자 정보 조회 중 오류 발생:', error);
            return res.status(500).json({message: '서버 오류가 발생했습니다.'});
        }
    },

    //회원정보 삭제
    deleteUser: async(req,res) => {
        //이미 세션에서 user_id를 가져옴 -> 자신의 계정만 삭제할 수 있음
        const {user_id} = req.session.user;

        //FIXME:트랜잭션으로 처리
        try{
            const user = await UserModel.getUserById(user_id);

            if(!user){
                return res.status(404).json({message:'사용자를 찾을 수 없습니다.'});
            }

            //프로필 사진 삭제
            if(user.profile_image){
                await deleteProfileImage(user.profile_image);
            }

            //사용자 관련 데이터 삭제
            await PostService.deleteUserRelatedData(user_id);

            //사용자 삭제
            const result = await UserModel.deleteUser(user_id);

            if(!result){
                return res.status(404).json({message:'사용자를 찾을 수 없습니다.'});
            }

            await new Promise((resolve, reject) => { 
                req.session.destroy(err => {
                    if(err) reject(err);
                    else resolve();
                });
            });
            
            //세션 쿠키 제거
            res.clearCookie('connect.sid'); 
            return res.status(200).json({message:'탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.'});
        }catch(error){
            return res.status(500).json({message: '서버 오류가 발생했습니다.'});
        }
    }
};

export default userController;