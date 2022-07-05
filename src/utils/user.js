const userUtils = {
    createUserName: (fnane, lname) => {
        let username = '';
        if(lname.length >= 4) {
            username = fname.substr(0,1) + lname.substr(0,49);
        } else {
            username = fname.substr(0,4) + lname.substr(0,49);
        }
        username = username.replace(/\s+/g, '');
        username = username.replace(/\'+/g, '');
        username = username.replace(/-+/g, '');
        username = username.toLowerCase();
        return username;
    }
};

const validateEmail = (email) => {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let match = email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)

    if (re && match !== null){
        return true
    }
    
    return false;
};

module.exports = {validateEmail, userUtils}
