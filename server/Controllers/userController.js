const path = require('path');
const {profileUpload} = require('../Service/multerConfig');
const UserService = require('../Service/UserService');


//이미지 조회
const getImage = async(user_id) => {
    const user = await UserService.getUserById(user_id);
    return user.image ? user.image : '';
}

//게시글 목록 조회: 프로필 이미지 조회
exports.getProfileImage = async(req,res) => {
    const image = await getImage(req.params.user_id);
    return res.status(200).json({image});
}

//프로필 이미지 조회
exports.getHeaderImage = async(req,res) => {
    const image = await getImage(req.user.user_id);
    return res.status(200).json({image});
}

// 회원정보 수정(닉네임,사진): 데이터 조회
exports.getEditUserData = async(req,res) => {
    try{   
        const user_id = req.user.user_id;
        const user = await UserService.getUserById(user_id);

        if(!user){
            return res.status(404).json({message:'회원정보가 없습니다.'});
        }

        return res.status(200).json({
            data: { name: user.name, email: user.email, image:user.image},
            message: 'get user data success'
        });
    } catch(error){
        console.error('사용자 정보 조회 중 오류 발생:', error);
        return res.status(500).json({message: '서버 오류가 발생했습니다.'});
    }

}

//회원정보 수정 : 닉네임,사진
exports.patchUserInfo = [profileUpload.single('image'),async(req,res) => {
    const user_id = req.session.user.user_id; //user_id from session
    const {name} = req.body;

    try{
        //사진이 있을 경우
        if(req.file){

            // 기존 프로필 삭제
            await UserService.deleteProfileImage(user_id);
        }

        //유저 정보 수정
        const user = await UserService.patchPost(user_id,{
            name,
            image : req.file ? req.file.filename : undefined
        });

        if(!user){
            return res.status(404).json({message:'user_not_found'});
        }

        return res.status(200).json({message: 'patch_userinfo_successful'});


    }catch(error){
        console.error('사용자 정보 조회 중 오류 발생:', error);
        return res.status(500).json({message: '서버 오류가 발생했습니다.'});
    }
}];

//회원정보 수정 : 패스워드
exports.patchPassword = async(req,res) => {

    const user_id = req.user.user_id; //user_id from session
    const {password} = req.body;

    try{

        if(!password){
            return res.status(400).json({message:'password_required'});
        }

        //유저 정보 수정
        const user = await UserService.patchPassword(user_id,password);

        if(!user){
            return res.status(404).json({message:'user_not_found'});
        }

        return res.status(200).json({message: 'patch_userinfo_successful'});


    }catch(error){
        console.error('사용자 정보 조회 중 오류 발생:', error);
        return res.status(500).json({message: '서버 오류가 발생했습니다.'});
    }

}

//회원정보 삭제
exports.deleteUser = async(req,res) => {
    const {user_id} = req.session.user;

    try{
        //권한 확인
        const isAuthorized = UserService.checkAuthorization(user_id);

        if(!isAuthorized){
            return res.status(400).json({message:'삭제 권한이 없습니다.'});
        }

        //프로필 사진 삭제
        await UserService.deleteProfileImage(user_id);

        //사용자 삭제
        const result = await UserService.deleteUser(user_id);

        if(!result){
            return res.status(404).json({message:'사용자를 찾을 수 없습니다.'});
        }


        await new Promise((resolve, reject) => { 
            req.session.destroy(err => {
                if(err) reject(err);
                else resolve();
            });
        });
        res.clearCookie('connect.sid'); 
        return res.status(200).json({message:'탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.'});

    }catch(error){
        console.error('사용자 정보 조회 중 오류 발생:', error);
        return res.status(500).json({message: '서버 오류가 발생했습니다.'});
    }
}