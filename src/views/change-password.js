$(document).ready(function () {
    function getAllUrlParams() {
        var url = window.location.search;
        var queryString = url.slice(1);
        var obj = {};
        if (queryString) {
            if (queryString.indexOf('redirect_to=') !== -1) {
                obj.redirect_to = url.slice(13);
            } else {
                queryString = queryString.split('#')[0];
                var arr = queryString.split('&');
                for (var i = 0; i < arr.length; i++) {
                    var a = arr[i].split('=');
                    var paramName = a[0];
                    var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
                    paramName = paramName.toLowerCase();
                    //if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
                    if (paramName.match(/\[(\d+)?\]$/)) {
                        var key = paramName.replace(/\[(\d+)?\]/, '');
                        if (!obj[key]) obj[key] = [];
                        if (paramName.match(/\[\d+\]$/)) {
                            var index = /\[(\d+)\]/.exec(paramName)[1];
                            obj[key][index] = paramValue;
                        } else {
                            obj[key].push(paramValue);
                        }
                    } else {
                        if (!obj[paramName]) {
                            obj[paramName] = paramValue;
                        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                            obj[paramName] = [obj[paramName]];
                            obj[paramName].push(paramValue);
                        } else {
                            obj[paramName].push(paramValue);
                        }
                    }
                }
            }
        }
        return obj;
    }


    $('#form').on('submit', function (e) {
        var emailId = $("#emailId").val();
        var password = $("#password").val();
        var verifyPassword = $("#verifyPassword").val();
        // console.log('password', password);
        // console.log('verifyPassword', verifyPassword);
        // console.log('NODE_ENV', process.env.NODE_ENV);
        let apiEndPoint;
        const pathName = window.location.pathname;
        if (pathName.includes('prod')) {
            apiEndPoint = 'https://api.honest.properties/prod/api/v1/user/password/reset/update';
        } else {
            apiEndPoint = 'https://api.honest.properties/dev/api/v1/user/password/reset/update';
        }

        if (emailId !== '' && password !== '' && verifyPassword !== '') {
            $('#email_id_err').text('').fadeOut();
            $('#password_err').text('').fadeOut();
            $('#verify_password_err').text('').fadeOut();
            if (password === verifyPassword) {
                const urls = getAllUrlParams();
                // console.log('urls', urls);
                // console.log('process.env', process.env);
                var reqPayload = JSON.stringify({
                    email_id: $('#emailId').val(),
                    password: $('#password').val(),
                    token: urls.token,
                });
                $.ajax(apiEndPoint, {
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json",
                    data: reqPayload,
                    timeout: 10000,
                    success: function (data, status, xhr) {
                        $("#form").hide();
                        $("#err_msg").hide();
                        $("#success_msg").fadeIn();
                    },
                    error: function (jqXhr, textStatus, errorMessage) {
                        // console.log('textStatus', textStatus);
                        // console.log('jqXhr', jqXhr);
                        // console.log('errorMessage', errorMessage);
                        let errMsg = '';
                        if (jqXhr.status === 401) {
                            errMsg = 'Link is expired or wrong token, Please try again.'
                        } else {
                            errMsg = 'Oops something went wrong! Please try again.'
                        }
                        $("#form").hide();
                        $("#success_msg").hide();
                        $("#err_msg").text(errMsg).fadeIn();
                    }
                });
            } else {
                $('#verify_password_err').text("Password do not match").fadeIn();
            }
        } else {
            if (emailId === '') {
                $('#email_id_err').text("Can't be blank").fadeIn();
            } else {
                $('#email_id_err').text('').fadeOut();
            }

            if (password === '') {
                $('#password_err').text("Can't be blank").fadeIn();
            } else {
                $('#password_err').text('').fadeOut();
            }

            if (verifyPassword === '') {
                $('#verify_password_err').text("Can't be blank").fadeIn();
            } else {
                $('#verify_password_err').text('').fadeOut();
            }
        }
        e.preventDefault();
    });
});
