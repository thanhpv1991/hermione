'use strict';

const BaseBrowserAgent = require('gemini-core').BrowserAgent;

module.exports = class BrowserAgent {
    static create(id, pool, test) {
        return new this(id, pool, test);
    }

    constructor(id, pool, test) {
        this._test = test;
        this._agent = BaseBrowserAgent.create(id, pool);
    }

    getBrowser(opts = {}) {
        opts.version = this._test.version;

        return this._agent.getBrowser(opts);
    }

    freeBrowser(browser) {
        return this._agent.freeBrowser(browser, {force: browser.state.isBroken});
    }

    get browserId() {
        return this._agent.browserId;
    }
};
