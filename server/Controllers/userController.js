const path = require('path');
const upload = require('../../community/JS/DashBoard/features/multerConfig');
const UserService = require('../../community/JS/Users/features/UserService');

//회원정보 수정(닉네임,사진) : 페이지 로드
exports.getEditUser = (req,res) => {
    res.sendFile(path.join(__dirname, '../../community/HTML', 'EditProfile.html'));
}

//회원정보 수정(패스워드) :페이지 로드
exports.getEditPassword = (req,res) => {
    res.sendFile(path.join(__dirname, '../../community/HTML', 'EditPassword.html'));
}

// 회원정보 수정(닉네임,사진): 데이터 조회
exports.getEditUserData = async(req,res) => {
    try{   
        const user_id = req.user.user_id;
        // console.log(user_id);
        const user = await UserService.getUserById(user_id);

        if(!user){
            return res.status(404).json({message:'회원정보가 없습니다.'});
        }

        return res.status(200).json({
            data: { name: user.name, email: user.email },
            message: 'get user data success'
        });
    } catch(error){
        console.error('사용자 정보 조회 중 오류 발생:', error);
        return res.status(500).json({message: '서버 오류가 발생했습니다.'});
    }

}

//회원정보 수정 : 닉네임,사진
exports.patchUserInfo = [upload.single('image'),async(req,res) => {
    const user_id = req.user.user_id; //user_id from session
    const {name} = req.body;

    try{
        //사진이 있을 경우
        if(req.file){
            // 기존 프로필 삭제
            // await UserService.deleteProfile();
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
exports.deleteUser = (req,res) => {}