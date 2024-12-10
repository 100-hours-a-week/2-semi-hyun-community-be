const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname,'../');
const userFilePath = path.join(rootDir,'data/json/login.json'); //폴더 경로 변경으로 수정

//json 저장 로직 : 모든 데이터를 로드 -> 특정 데이터 find 
//-> 데이터 수정 -> 수정한 데이터로 덮기

//사용자 권한 확인
const checkAuthorization = (user_id) => {
    const users = getAllUsers();
    const user = users.find(user => user.user_id === user_id);
    if (!user) {
        return false;
    }
    return user.user_id === user_id;
}

//데이터 저장 -> promise로 return
const saveUsers = async (users) => {
    try{
        //NOTE fs
        // 1. 콜백 기반 API     fs.writeFile(file,data,callback)
        // 2. 동기식 API        fs.writeFileSync(file,data)
        // 3. promise 기반 API  fs.promises.writeFile(file,data) 
        await fs.promises.writeFile(userFilePath, JSON.stringify(users,null,2),'utf8');
        return true;
    }catch(error){
        console.error('Error writing user:',error);
    }
}

//모든 데이터 조회
const getAllUsers = () =>{
    try{
        if(!fs.existsSync(userFilePath)){
            return []; //파일이 없다면 빈 배열 반환
        }

        const usersData = fs.readFileSync(userFilePath,'utf8');
        return JSON.parse(usersData);
    }catch(error){
        console.error('Error reading user:',error);
    }
}

//특정 데이터 조회
const getUserById = (user_id) => {
    const users = getAllUsers();
    const user = users.find(user => user.user_id === user_id);

    if(!user) {
        return null;
    }

    return user;
}

//프로필 이미지 삭제.
const deleteProfileImage = async(user_id) => {
    //게시글 정보 가져오기
    const users = getAllUsers();
    const user = users.find(user => user.user_id === user_id);

    if (!user || !user.image) {
        return false;
    }

    const imagePath = path.join(rootDir,'data/images/profile/',user.image);

    try{

        //NOTE : unlink is using the callback-based API. not the promise-based API.
        console.log(imagePath);
        await fs.promises.unlink(imagePath);
        console.log('프로필 삭제 완료');
        return true;
    }catch(error){
        console.error('Error deleting image:', error);
        return false;
    }
}

//회원 정보 수정
const patchPost = async (user_id,userdata) => {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.user_id === user_id);

    if(userIndex === -1){
        return null
    }

    //데이터 수정 (스프레드 연산자 사용)
    users[userIndex] ={
        ...users[userIndex],
        name: userdata.name,
        image : userdata.image? userdata.image : users[userIndex].image,
        updated_date: new Date().toISOString()
    };

    //수정된 데이터를 저장
    await saveUsers(users);

    return true;
}

//비밀번호 수정
const patchPassword = async (user_id,password) => {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.user_id === user_id);

    if(userIndex === -1){
        return null
    }

    //데이터 수정 (스프레드 연산자 사용)
    users[userIndex] ={
        ...users[userIndex],
        password : password,
        updated_date: new Date().toISOString()
    };

    //수정된 데이터를 저장
    await saveUsers(users);

    return true;
}

//사용자 삭제
const deleteUser = async (user_id) => {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.user_id === user_id);

    if(userIndex === -1){
        return false;
    }
    //NOTE : splice(수정시작위치, 삭제할 요소 갯수, 배열에 추가할 새로운 요소)
    users.splice(userIndex,1);
    await saveUsers(users);

    return true;

}

module.exports ={
    checkAuthorization,
    getUserById,
    deleteProfileImage,
    deleteUser,
    patchPost,
    patchPassword
}