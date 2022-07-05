const express = require('express'),
    router = express.Router(),
    multerUpload = require('../lib/multer'),
    oauthController = require('../controllers/oauth'),
    userController = require('../controllers/user'),
    userVerificationController = require('../controllers/user_verification');

module.exports = (requireAuth) => {
    /* authentication routes */
    router.post('/v1/oauth/login', oauthController.login);
    router.get('/v1/oauth/token/validate', oauthController.validateToken);
    router.get('/v1/oauth/token/refresh', oauthController.refreshToken);

    /* User routes */
    const cpUpload = multerUpload.fields([{name: 'fileName', maxCount: 10}]);
    router.post('/v1/user/signup', userController.signUp);
    router.post('/v1/user/signin', userController.signIn);
    
    //todo: User update profile: Firstname, Lastname, phone number and address.
    router.post('/v1/user/profile', userController.updateProfile);
    router.post('/v1/user/profileImage', requireAuth, cpUpload, userController.uploadProfileImage);
    router.get('/v1/user/profileImage', requireAuth, userController.readProfileImage);

    /* User Password routes */
    router.post('/v1/user/password/reset/verification', userVerificationController.sendVerificationEmail);
    router.post('/v1/user/password/reset/update', userVerificationController.resetPassword);

    // /* Media routes */
    // //todo: Handle multiple images with same name
    // router.post('/v1/media/save/image', requireAuth, cpUpload, mediaController.saveImage);
    // router.post('/v1/media/update', requireAuth, mediaController.updateMedia);
    // router.get('/v1/media/listAll', requireAuth, mediaController.listAllMedia);
    // router.get('/v1/media/get', requireAuth, mediaController.readMedia);
    // router.delete('/v1/media/delete', requireAuth, mediaController.deleteMedia);

    /* Environment variable routes */
    router.get('/v1/env/host', oauthController.getHost);

    return router;
};
