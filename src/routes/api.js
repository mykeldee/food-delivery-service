const express = require('express'),
    router = express.Router(),
    multerUpload = require('../lib/multer'),
    oauthController = require('../controllers/oauth'),
    userController = require('../controllers/user'),
    userVerificationController = require('../controllers/user_verification'),
    {menuController,restaurantController} = require('../controllers/restaurants');

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

    /* restaurants routes */
    router.get('/v1/restaurants', requireAuth, restaurantController.getRestaurants);
    // router.post('/v1/restaurants', restaurantController.addRestaurant);
    // router.get('/v1/restaurants/menu', menuController.getItem);
    // router.post('/v1/restaurants/menu', menuController.addItem);

    /* User Password routes */
    // router.post('/v1/user/password/reset/verification', userVerificationController.sendVerificationEmail);
    // router.post('/v1/user/password/reset/update', userVerificationController.resetPassword);

    /* Environment variable routes */
    router.get('/v1/env/host', oauthController.getHost);

    return router;
};
