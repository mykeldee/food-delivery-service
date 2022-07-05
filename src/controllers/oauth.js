const User = require('../models/user');

const oauthController = {
    login: (req, res) => {
        let client_id = req.body.user_name !== undefined ? req.body.user_name : null,
            client_secret = req.body.password !== undefined ? req.body.password : null,
            grant_type = 'CLIENT_CREDENTIALS',
            loginInfo = {client_id, client_secret, grant_type};

        User.userLogin(loginInfo, (response) => {
            res.json(response);
        });
    },

    validateToken: (req, res) => {
        const token = req.headers.authorization;

        User.validateToken(token, (response) => {
            res.json(response);
        });
    },

    refreshToken: (req, res) => {
        const token = req.headers.authorization;

        User.refreshToken(token, (response) => {
            res.json(response);
        });
    },

    getHost: (req, res) => {
        const hostname = process.env.APP_HOST;
        let apiPrepend;
        switch (process.env.NODE_ENV) {
            case 'development':
                apiPrepend = 'dev';
                break;
            case 'mind-spa-staging':
                apiPrepend = 'stage';
                break;
            default:
                apiPrepend = 'dev';
        }
        res.status(200);
        res.json({
            success: true,
            message: 'Env read successfully',
            content: {
                host: hostname + "/" + apiPrepend
            }
        });
        return res;
    }
};
module.exports = oauthController;
