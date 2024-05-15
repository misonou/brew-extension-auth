const JSDOMEnvironment = require('jest-environment-jsdom');

module.exports = class extends JSDOMEnvironment.default {
    async setup() {
        await super.setup();
        this.global.fetch = fetch;
        this.global.Request = Request;
        this.global.Response = Response;
    }
};
