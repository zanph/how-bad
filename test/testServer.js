const chai   = require('chai');
const expect = chai.expect;
const assert = chai.assert;

//load our server module
const server = require('../server.js');

//load functions
//we probably dont need to test onRequest yet??
var onRequest   = server.onRequest;

//these 3 should definitely be tested.
var validateReq = server.validateReq;
var findID      = server.findID;
var callAPI     = server.callAPI;

describe('validateReq', function() {

    it('should accept a zip code and return an OK flag', function () {
        let request = { 'q':60304 };
        let response = validateReq(request);
        expect(response).to.be.a('object');
        expect(response).to.have.property('flag');
        expect(response.flag, 'response flag:').to.equal('OK');
    });

    it('should return an error flag for an invalid zip code', function() {
        let request = { 'q':111 };
        let response = validateReq(request);
        expect(response).to.be.a('object');
        expect(response).to.have.property('flag');
        expect(response.flag, 'response flag:').to
            .equal('ERROR: Invalid zip');
    });
      
});
