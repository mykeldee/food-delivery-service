const bcrypt = require('bcryptjs');
const sha256 = require('sha256');
const jwt = require('jwt-simple');
const moment = require('moment-timezone');
const characterRolesArr = ["MEMBER", "OWNER"];
const fs = require('fs');

const saltRound = 10;
let utils = {};

utils.getSafePassword = (password, callback) => {
    if (typeof callback !== 'function') return;

    if (typeof password === "string") {
        password = sha256(password);
    }
    else { // 'password' is an object
        if (password.algorithm !== "sha-256") {
            throw new Error("Invalid password hash algorithm. " +
            "Only 'sha-256' is allowed.");
        }
        password = password.digest;
    }

    bcrypt.genSalt(saltRound, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            callback(err, hash);
        });
    });
};

utils.isCorrectMatch = (passwordString, hash, callback) => {
    const encryptedPassword = sha256(passwordString);
    bcrypt.compare(encryptedPassword, hash, (err, res) => {
        callback(err, res);
    });
};

utils.tokenForUser = (user, remember) => {
    let issueDate = new Date().getTime();
    let lifetime = 1000 * 60 * 60 * 2; // default - 2 hour life
    if (remember) lifetime = 1000 * 60 * 60 * 24 * 7; // 7 days life
    return jwt.encode({
        sub: user.id,
        role: user.usage_role,
        validated: user.validated,
        iat: issueDate,
        expat: issueDate + lifetime,
        wizard: {done: false}
    }, process.env.JWT_SECRET);
};

utils.getPayload = (token) => {
    // get the decoded payload, given the JWT secret key
    if (token)
        return jwt.decode(token, process.env.JWT_SECRET, true);
};

utils.getContentTypeByFile = fileName => {
    let rc = 'application/octet-stream';
    let fn = fileName.toLowerCase();

    if (fn.indexOf('.html') >= 0) rc = 'text/html';
    else if (fn.indexOf('.css') >= 0) rc = 'text/css';
    else if (fn.indexOf('.json') >= 0) rc = 'application/json';
    else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
    else if (fn.indexOf('.png') >= 0) rc = 'image/png';
    else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';

    return rc;
};

utils.convertUTCTimeToSpecificTimezone = (date_time, time_zone) => {
    //console.log("zone object is " + JSON.stringify(moment.tz.zone(time_zone)));
    let utc_date_time = moment.tz(date_time, 'UTC'),
        date_time_obj = moment(utc_date_time).tz(time_zone),
        date = date_time_obj.format('MM/DD/YYYY'),
        time = date_time_obj.format('HH:mm:ss A');
    /*    console.log("UTC date is " + utc_date_time.format() + " and time zone is " + time_zone);
     console.log("converted date is " + date_time_obj.format('MM/DD/YYYY'));
     console.log("converted time is " + date_time_obj.format('HH:mm:ss A'));*/

    return {date, time, date_time_obj};
}

/*utils.mapGMTToTimezoneName = () => {
 // Get names of all available timezones in moment library
 var timeZones = moment.tz.names();
 console.log(timeZones.length);
 var offsetTimezoneMapping = [];

 for (var zone_name in timeZones) {
 offsetTimezoneMapping.push("(GMT"+ moment.tz(timeZones[zone_name]).format('Z')+")" + timeZones[zone_name]);
 }
 console.log(offsetTimezoneMapping);
 }*/

utils.youEmbed = (ID) => {
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/` + ID + `" frameborder="0" allowfullscreen></iframe>`
};

utils.vimeoEmbed = (ID) => {
    return `<iframe src="https://player.vimeo.com/video/` + ID + `" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`
};

utils.uninterruptedEmbed = (ID) => {
    return `<iframe src="//content.jwplatform.com/players/` + ID + `.html" width="100%" height="100%" frameborder="0" scrolling="auto" allowfullscreen style="position:absolute;"></iframe>`
};

utils.streamableEmbed = (ID) => {
    return `<div style="width:100%;height:0px;position:relative;padding-bottom:56.250%;"><iframe src="https://streamable.com/s/` + ID + `/gojs" frameborder="0" width="100%" height="100%" allowfullscreen style="width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden;"></iframe></div>`
};

// This method is used to parse only video url supported by Ballprk
utils.parseVideoUrl = (url) => {
    var iFrame = null,
        vimeoRegex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i,
        youtubeRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/,
        streamableRegex = /(?:streamable)\.com\/(.+)/i,
        uninterruptedRegex = /(.+)(?:uninterrupted)\.com\/(.+)/i;

    if (/(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i.test(url)) {
        //console.log("This is vimeo video");
        iFrame = utils.vimeoEmbed(url.match(vimeoRegex)[1]);
    } else if (/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/.test(url)) {
        //console.log("This is youtube video");
        var match = url.match(youtubeRegex),
            ID = (match && match[7].length == 11) ? match[7] : false;
        iFrame = utils.youEmbed(ID);
    } else if (/(?:streamable)\.com\/(.+)/i.test(url)) {
        //console.log("This is streamable video");
        iFrame = utils.streamableEmbed(url.match(streamableRegex)[1]);
    } else if (/(.+)(?:uninterrupted)\.com\/(.+)/i.test(url)) {
        //console.log("This is Uninterrupted video");
        var ID = url.match(uninterruptedRegex)[2].split("/")[1];
        iFrame = utils.uninterruptedEmbed(ID);
    } else {
        console.log("This is not a video");
    }
    return iFrame;
};

utils.createFilterString = (filter, valuesList) => {
    // Remove all the spaces in the comma separated values list
    // Double quote all the values in the list
    let values = '"' + valuesList.replace(/\s*,\s*/g, '","') + '"';
    // Split the double quoted list of values with comma and then join the values with OR
    var result = filter + ":(" + values.split(',').join('OR') + ")";
    return result;
};

utils.isAuthorized = (userRole, adminRole) => {
    let userRoleIndex =  characterRolesArr.indexOf(userRole),
        adminRoleIndex = characterRolesArr.indexOf(adminRole);
    if (userRoleIndex == -1 || adminRoleIndex == -1) {
        return false;
    }
    // User can not be added / removed by other user
    if (userRoleIndex == 0 && adminRoleIndex == 0) {
        return false;
    }
    // Brand manager can not be added / removed by another brand manager
    if (userRoleIndex == 2 && adminRoleIndex == 2) {
        return false;
    }
    if (userRoleIndex <= adminRoleIndex) {
        return true;
    } else {
        return false;
    }
};

utils.sanitizeSearchString = (str) => {
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim();
};

utils.copyFile = (source, target) => {
    var rd = fs.createReadStream(source);
    var wr = fs.createWriteStream(target);
    return new Promise(function(resolve, reject) {
        rd.on('error', reject);
        wr.on('error', reject);
        wr.on('finish', resolve);
        rd.pipe(wr);
    }).catch(function(error) {
            rd.destroy();
            wr.end();
            throw error;
        });
};

module.exports = utils;