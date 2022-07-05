const utils = {
    isDataValid: data => {
        let isValid = false;
        if (data !== undefined && data !== null) isValid = true;
        return isValid;
    },
    isStringNonEmpty: data => {
        let isNonEmpty = false;
        if (utils.isDataValid(data)) {
            if (data !== '') isNonEmpty = true;
        }
        return isNonEmpty;
    }
};

module.exports = utils;
