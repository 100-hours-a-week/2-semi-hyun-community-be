function getTime(){
    const now = new Date().toISOString();
    return now;
}

module.exports = {getTime};