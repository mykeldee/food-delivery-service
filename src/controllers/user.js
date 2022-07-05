const models = require('../models/user');
// const _ = require('lodash');
const commanUtils = require('../utils/common');
const utils = require('../lib/utils');
const jwt = require('jsonwebtoken');
const restResponse = require('../lib/rest_response');
const fs = require('fs');
const uuid = require('uuid');

console.log(models)

const userController = {
  signUp: (req, res) => {
    let userData = {};

    // userData.username = userUtils(req.body.first_name, req.body.last_name);
    if (req.body.first_name !== undefined && req.body.first_name !== '') {
      userData.first_name = req.body.first_name;
    }
    if (req.body.last_name !== undefined && req.body.last_name !== '') {
      userData.last_name = req.body.last_name;
    }
    if (req.body.email_id !== undefined && req.body.email_id !== '') {
      userData.email_id = req.body.email_id;
    }
    if (req.body.password !== undefined && req.body.password !== '') {
      userData.password = req.body.password;
    }
    if (req.body.phone !== undefined && req.body.phone !== '') {
      userData.phone = req.body.phone;
    }
    if (req.body.address !== undefined && req.body.address !== '') {
      userData.address = req.body.address;
    }

    if (
      commanUtils.isStringNonEmpty(userData.first_name) &&
      commanUtils.isStringNonEmpty(userData.last_name) &&
      commanUtils.isStringNonEmpty(userData.email_id) &&
      commanUtils.isStringNonEmpty(userData.password)
    ) {
      models.findOne({email_id: userData.email_id}).then(
        user => {
          if (user === null) {
            userData.id = uuid.v4();
            utils.getSafePassword(userData.password, (err, passwordHash) => {
              if (err) {
                restResponse.success = false;
                restResponse.errors = {
                  password: 'Invalid Password',
                };
                return res.json(restResponse);
              }
              userData.password = passwordHash;
              const email = userData.email_id;
              models.create(userData)
                .then( (result) => {
                  res.status(201);
                  res.json({
                    success: true,
                    message: 'User created successfully',
                    data: {
                      user: email,
                      access_token: jwt.sign(
                        {
                          email:email
                        },
                        process.env.JWT_SECRET,
                        {
                          expiresIn: 30 * 24 * 60 * 60,
                        }
                      ),
                    },
                  });
                  return res;
                })
                .catch(err => {
                  console.log('err', err);
                });
            });
          } else {
            res.status = 409;
            res.json({ success: false, message: 'user already exits' });
            return res;
          }
          // project will be the first entry of the Projects table with the title 'aProject' || null
        }
      );
    } else {
      res.status = 400;
      res.json({ success: false, message: 'Please provide valid data' });
    }

    // Send new user sign up email to team
    // EmailController.sendNewUserSignedUpEmail(newUserInfo, null);
  },

  signIn: (req, res) => {
    const email_id = req.body.email_id;
    const password = req.body.password;
    if (
      commanUtils.isStringNonEmpty(email_id) &&
      commanUtils.isStringNonEmpty(password)
    ) {
      models.findOne({ where: { email_id } }).then(user => {
        if (user === null) {
          res.status = 401;
          res.json({
            success: false,
            message: 'Email id and password combination do not match',
          });
        } else {
          console.log(user)
          utils.isCorrectMatch(password, user.password, (err, result) => {
            if (result) {
              res.status = 200;
              res.json({
                success: true,
                message: 'Login successful!',
                data: {
                  user: user,
                  access_token: jwt.sign(
                    {
                      id: user.id,
                      email_id: user.email_id,
                    },
                    process.env.JWT_SECRET,
                    {
                      expiresIn: 30 * 24 * 60 * 60,
                    }
                  ),
                },
              });
            } else {
              res.status = 401;
              res.json({
                success: false,
                message: 'Email id and password combination do not match',
              });
              return res;
            }
          });
        }
      });
    } else {
      res.status = 400;
      res.json({
        success: false,
        message: 'Please provide valid data',
      });
      return res;
    }
  },

  findOrCreate: (userData, res) => {
    if (
      commanUtils.isStringNonEmpty(userData.first_name) &&
      commanUtils.isStringNonEmpty(userData.last_name) &&
      commanUtils.isStringNonEmpty(userData.email_id) &&
      models.findOne({ where: { email_id: userData.email_id } })
        .then(user => {
          if (user === null) {
            console.log('User not found; creating new user ');
            models.create(userData)
              .then(function ({ dataValues }) {
                //console.log("User is ", JSON.stringify(dataValues));
                let newUserResponse = {
                  success: true,
                  message: 'User created successfully',
                  data: {
                    user: dataValues,
                    access_token: jwt.sign(
                      {
                        id: dataValues.id,
                        email_id: dataValues.email_id,
                      },
                      process.env.JWT_SECRET,
                      {
                        expiresIn: 30 * 24 * 60 * 60,
                      }
                    ),
                  },
                };
                res(newUserResponse);
              })
              .catch(err => {
                console.log('ERROR:', err);
              });
          } else {
            //login
            let userResponse = {
              success: true,
              message: 'User login successful',
              data: {
                user: user,
                access_token: jwt.sign(
                  {
                    id: user.id,
                    email_id: user.email_id,
                  },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: 30 * 24 * 60 * 60,
                  }
                ),
              },
            };
            //console.log("user response: ", JSON.stringify(userResponse));
            res(userResponse);
          }
        })
        .catch(err => {
          console.log('ERROR:', err);
        })
    );
    else {
      console.log('ERROR: data not found in google app');
    }
  },

  uploadProfileImage: (req, res) => {
    const fileNameObject = req.files.fileName[0];
    let response = restResponse();
    const fileTmpPath = fileNameObject.path;
    let fileSizeInBytes = fileNameObject.size;
    let name;
    if (req.query.name !== undefined && req.query.name !== '') {
      name = req.query.name;
    } else {
      response.success = false;
      response.errors = ['file name not present'];
      fs.unlink(fileTmpPath, err => {
        if (err) console.log('Error while removing tmp file: ', err);
      });

      return res.json(response);
    }

    if (
      ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].indexOf(
        fileNameObject.mimetype.toLowerCase()
      ) === -1
    ) {
      response.success = false;
      response.errors = ['Invalid file type'];
      fs.unlink(fileTmpPath, err => {
        if (err) console.log('Error while removing tmp file: ', err);
      });

      return res.json(response);
    }
    //console.log("file name object is " + JSON.stringify(fileNameObject));
    //console.log("file name is " + fileNameObject);
    //console.log("file size in bytes: " + fileSizeInBytes);
    //console.log("file name: " + name);

    if (fileSizeInBytes <= process.env.UPLOAD_IMAGE_MAX_SIZE) {
      const token = req.headers.authorization;
      const userId = utils.getPayload(token).id;
      const filePermPath = process.env.USER_PROFILE_DIR_PATH + userId;
      const destinationFile = filePermPath + '/' + name;
      //console.log("Profile image permanent path is " + filePermPath);
      if (!fs.existsSync(filePermPath)) {
        fs.mkdirSync(filePermPath);
      }
      fs.writeFileSync(destinationFile, fs.readFileSync(fileTmpPath));
      fs.unlink(fileTmpPath, err => {
        if (err) console.log('Error while removing tmp file: ', err);
      });
      //console.log("Profile image is located at: " + destinationFile);
      //update user
      userController.findById(userId, user => {
        if (user !== null) {
          let updateData = {};
          updateData.id = userId;
          updateData.profile_image_path = destinationFile;
          user.update(updateData).then(
            updatedUser => {
              if (updatedUser) {
                response.success = true;
                response.content = {
                  image: {
                    fileName: name,
                    sizeInBytes: fileSizeInBytes,
                  },
                };
                return res.json(response);
              }
            },
            error => {
              response.success = false;
              response.errors.message =
                'Unable to update user with profile image';
              console.log(
                'Error while updating profile image for user with user id: ' +
                  userId +
                  ' ERROR: ' +
                  error
              );
              return res.json(response);
            }
          );
        } else {
          response.success = false;
          response.errors.push('User Not found');
          console.log('User not found. Authorization error');
          return res.sendStatus(401);
        }
      });
      //res.json(response);
    } else {
      fs.unlink(fileTmpPath, err => {
        if (err) console.log('Error while removing tmp file: ', err);
      });
      response.success = false;
      response.errors.push('File size exceeds the max size limit');
      console.log('File size exceeds the limit for uploading image');
      return res.json(response);
    }
  },

  readProfileImage: (req, res) => {
    const token = req.headers.authorization;
    const userId = utils.getPayload(token).id;
    let fileName;
    if (req.query.file_name !== undefined && req.query.file_name !== '') {
      fileName = req.query.file_name;
    }
    let response = restResponse();
    const filePermPath =
      process.env.USER_PROFILE_DIR_PATH + userId + '/' + fileName;
    //console.log('File path is : ' + filePermPath);

    fs.readFile(filePermPath, function (err, image) {
      if (err) {
        response.success = false;
        response.errors.push('File not found');
        console.log('File not found: ' + filePermPath);
        return res.json(response);
      }
      //const img = Buffer.from(image,);
      const img = Buffer.from(image, 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length,
      });
      res.end(img);
    });
  },

  updateProfile: (req, res) => {
    const token = req.headers.authorization;
    const userId = utils.getPayload(token).id;
    const jsonResponse = restResponse();

    userController.findById(userId, user => {
      if (user !== null) {
        let updateData = {};

        if (req.body.first_name !== undefined && req.body.first_name !== '') {
          updateData.first_name = req.body.first_name;
        }
        if (req.body.last_name !== undefined && req.body.last_name !== '') {
          updateData.last_name = req.body.last_name;
        }
        if (req.body.phone !== undefined && req.body.phone !== '') {
          updateData.phone = req.body.phone;
        }
        if (
          req.body.profile_image_path !== undefined &&
          req.body.profile_image_path !== ''
        ) {
          updateData.profile_image_path = req.body.profile_image_path;
        }

        user.update(updateData).then(
          updatedUser => {
            if (updatedUser) {
              jsonResponse.success = true;
              jsonResponse.content = updatedUser;
              res.json(jsonResponse);
            }
          },
          error => {
            jsonResponse.success = false;
            jsonResponse.errors.message = 'Unable to update user';
            console.log(
              'Error while updating password for user with user id: ' +
                userId +
                ' ERROR: ' +
                error
            );
            return res.json(jsonResponse);
          }
        );
      } else {
        jsonResponse.success = false;
        jsonResponse.errors.push('User Not found');
        console.log('User not found. Authorization error');
        return res.sendStatus(401);
      }

      user.update(updateData).then(
        updatedUser => {
          if (updatedUser) {
            jsonResponse.success = true;
            jsonResponse.content = updatedUser;
            res.json(jsonResponse);
          }
        },
        error => {
          jsonResponse.success = false;
          jsonResponse.errors.message = 'Unable to update user';
          console.log(
            'Error while updating password for user with user id: ' +
              userId +
              ' ERROR: ' +
              error
          );
          return res.json(jsonResponse);
        }
      );
      // } else {
      //   jsonResponse.success = false;
      //   jsonResponse.errors.push('User Not found');
      //   console.log('User not found. Authorization error');
      //   return res.sendStatus(401);
      // }
    });
  },

  findById: (id, res) => {
    models.findOne({ where: { id: id } }).then(user => {
      res(user);
    });
  },

};

module.exports = userController;

module.exports.GoogleSignin = (req, res) => {
  // res.json(req.user);
  res.render('social-auth-middleware', {
    responseData: JSON.stringify(req.user),
  });
  res.end();
};
