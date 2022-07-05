// "use strict";
// const models = require('../models');
// const uuid = require('uuid');
// const _ = require('lodash');
// const utils = require('../lib/utils');
// const restResponse = require('../lib/rest_response');
// const EmailController = require('./email');

// class UserVerification {

//     // Create an email one time key and store in the db email address.
//     // use the key to create a link and send in an email.
//     static sendVerificationEmail(req, res) {
//         let email = req.body.email_id,
//             jsonResp = restResponse();
//         let apiPrepend;
//         switch (process.env.NODE_ENV) {
//             case 'development':
//                 apiPrepend = 'dev';
//                 break;
//             case 'mind-spa-staging':
//                 apiPrepend = 'stage';
//                 break;
//             default:
//                 apiPrepend = 'dev';
//         }
//         // 1. Get the user by email
//         models.User.findOne({where: {email_id: email}}).then(user => {
//             if (user) {
//                 // 2. Fetch userId from user object
//                 let userData = {
//                         user_id: user.id,
//                         login_id: user.email_id,
//                         expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // set one year from now
//                         email_verification_token: uuid(),
//                         is_valid: true
//                     },
//                     firstName = user.first_name;

//                 // 3. Create user verification password recovery token and then create password reset link
//                 models.UserVerification.create(userData).then(function ({dataValues}) {
//                     //console.log("result is " + JSON.stringify(dataValues));
//                     let verifyToken = dataValues.email_verification_token,
//                         appURL = `${process.env.APP_HOST}`,
//                         resetLink = `${appURL}/${apiPrepend}/change-password?token=${verifyToken}`;

//                     // 4. Send an email to user with password reset link
//                     // EmailController.sendPasswordRecoverEmail(appURL, email, firstName, resetLink);

//                     jsonResp.success = true;
//                     jsonResp.content = 'Email sent successfully';
//                     res.status(200);

//                     return res.json(jsonResp);
//                 })
//                     .catch(err => {
//                         console.log(`${UserVerification.name}.forgot() Error Occurred`, err);
//                         jsonResp.success = false;
//                         jsonResp.errors.push(err);
//                         return res.json(jsonResp);
//                     })
//             } else {
//                 jsonResp.success = false;
//                 jsonResp.errors.email = 'Incorrect Email Address';
//                 return res.json(jsonResp);
//             }
//         }, err => {
//             console.log(`Inside ${UserVerification.name} Get user by email. Error() =>>`, err);
//             jsonResp.success = false;
//             jsonResp.errors.message = 'Incorrect Email Address';

//             return res.json(jsonResp);
//         });
//     }

//     // Reset password
//     static resetPassword(req, res) {
//         let email = req.body.email_id,
//             verificationToken = req.body.token,
//             newPassword = req.body.password,
//             jsonResponse = restResponse();
//         // 1. Get the user verification row and validate token, email_id combination with is_valid = true
//         models.UserVerification.findOne({
//             where: {
//                 login_id: email,
//                 email_verification_token: verificationToken,
//                 is_valid: true
//             }
//         }).
//             then(userVerification => {
//                 console.log("result is " + JSON.stringify(userVerification));
//                 // 2. if user verification row is not null
//                 if (userVerification) {
//                     // 3. Check if token is not expired yet i.e. expiry is greater than current timestamp
//                     if (userVerification.expiry > new Date()) {
//                         // 4. Get user by email
//                         models.User.findOne({where: {email_id: email}}).then(user => {
//                             //5. hash the new password, update user and return new token
//                             if (user) {
//                                 utils.getSafePassword(newPassword, (err, passwordHash) => {
//                                     if (err) {
//                                         jsonResponse.success = false;
//                                         jsonResponse.errors = {
//                                             password: "Invalid new password"
//                                         };
//                                         return res.json(jsonResponse);
//                                     }
//                                     let updateData = {
//                                         "userId": user.id,
//                                         "password": passwordHash
//                                     };

//                                     user.update(updateData).then(updatedUser => {
//                                         if (updatedUser) {
//                                             //Mark user verification row is_valid false.
//                                             let updateUserVerificationData = {
//                                                 "is_valid": false
//                                             };
//                                             userVerification.update(updateUserVerificationData);
//                                             jsonResponse.success = true;
//                                             let responseToken = utils.tokenForUser(updatedUser);
//                                             jsonResponse.content = {responseToken};
//                                             res.json(jsonResponse);
//                                         } else {
//                                             jsonResponse.success = false;
//                                             jsonResponse.errors.message = 'Unable to update user with new password';
//                                             console.log('Error while updating password for user with user id: ' + userId + ' ERROR: ' + error);
//                                             return res.json(jsonResponse);
//                                         }
//                                     });
//                                 });
//                             } else {
//                                 jsonResponse.success = false;
//                                 jsonResponse.errors.push("User not found");
//                                 console.log("Email does not exists.");
//                                 return res.sendStatus(401);
//                             }
//                         });
//                     } else {
//                         jsonResponse.success = false;
//                         jsonResponse.errors.push("Link expired");
//                         console.log("Reset link expired");
//                         return res.sendStatus(401);
//                     }
//                 } else {
//                     jsonResponse.success = false;
//                     jsonResponse.errors.push("Token Invalid");
//                     console.log("Verification token invalid");
//                     return res.sendStatus(401);
//                 }
//             });
//     }

//     static checkEmailVerified(req, res) {
//         let jsonResp = restResponse(),
//             userId = req.params.id,
//             token = req.params.token;

//         userVerificationModel.getEmailVerificationToken(userId, token, result => {
//             if (result) {
//                 jsonResp.success = true;
//                 result = result.content[0];
//                 if (result.valid === true) {
//                     // Update user settings
//                     let updateSettingsData = {
//                         "user_id": userId,
//                         "email": {
//                             "verified": true
//                         }
//                     };

//                     userSettings.updateUserSettings(updateSettingsData, updatedUserSettings => {
//                         //console.log("updated user settings are " + JSON.stringify(updatedUserSettings));
//                     }, err => {
//                         console.log(`Inside ${UserVerification.name} Unable to update user settings. Error() =>>`, err);
//                     });
//                     jsonResp.content = {"verified": true};
//                 } else {
//                     jsonResp.content = {"verified": false};
//                 }
//                 res.json(jsonResp);
//             }

//         }, error => {
//             console.log(`Inside ${UserVerification.name} Unable to get user email verififcation token. Error() =>>`, error);
//             jsonResp.success = false;
//             jsonResp.errors.message = 'Incorrect user id or email verification token';

//             return res.json(jsonResp);
//         });
//     }
// }

// module.exports = UserVerification;