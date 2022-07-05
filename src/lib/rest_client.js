'use strict';

let http = require('http');
let request = require('request');

class RestCient {
    constructor(options) {
        options.host = options.port === '80' ? options.host : `${options.host}:${options.port}`;
        this.apiUrl = `https://${options.host}/${options.apiChannel}/${options.apiVersion}`;
        this.configs = {
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/json'
            },
            json: true
        };
    }

    get(options, callback) {
        let params = {
            method: 'GET',
            url: `${ this.apiUrl }/${ options.path ? options.path : '' }`
        };
        if (options.headers) params.headers = options.headers;

        return this.request(params, callback);
    }

    post(options, callback) {
        let params = {
            method: 'POST',
            url: `${ this.apiUrl }/${ options.path ? options.path : '' }`,
            body: options.body || {}
        };
        if (options.headers) params.headers = options.headers;

        return this.request(params, callback);
    }

    put(options, callback) {
        let params = {
            method: 'PUT',
            url: `${ this.apiUrl }/${ options.path ? options.path : '' }`,
            body: options.body || {}
        };
        if (options.headers) params.headers = options.headers;

        return this.request(params, callback);
    }

    delete(options, callback) {
        let params = {
            method: 'DELETE',
            url: `${ this.apiUrl }/${ options.path ? options.path : '' }`,
            body: options.body || {}
        };

        return this.request(params, callback);
    }

    request(options, callback) {
        options.headers = (options.headers) ? Object.assign(options.headers, this.configs.headers) : this.configs.headers;
        options.json = this.configs.json;

        request(options, (error, response, body) => {
            if (error) {
                console.log("Inside REST client library: Error while making call to backend service");
                return;
            }
            callback(body);

        });
    }
}

module.exports = RestCient;