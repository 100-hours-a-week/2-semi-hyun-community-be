const authMiddleware = (req, res, next) => {

    //세션 존재 여부확인
    if (!req.session.user) {
        return res.status(401).json({message: 'required_authorization'});
    }


    // 요청된 리소스의 사용자 ID와 현재 로그인한 사용자 ID 비교
    // const requestedUserId = req.params.user_id || req.body.user_id;
    
    // if (requestedUserId && req.session.user.user_id !== requestedUserId) {
    //     return res.status(403).json({message: 'unauthorized_access'});
    // }
    // console.log('인증 성공');

    //req 객체에 사용자 정보 추가
    req.user = req.session.user;
    next();
}

module.exports = authMiddleware;