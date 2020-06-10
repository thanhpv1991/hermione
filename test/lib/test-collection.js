'use strict';

const TestCollection = require('lib/test-collection');
const {makeConfigStub} = require('../utils');

describe('test-collection', () => {
    describe('getBrowsers', () => {
        it('should return browsers from passed specs', () => {
            const collection = TestCollection.create({
                'bro1': [],
                'bro2': []
            });

            const browsers = collection.getBrowsers();

            assert.deepEqual(browsers, ['bro1', 'bro2']);
        });
    });

    describe('mapTests', () => {
        it('should map over tests for passed browser', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2, test3]
            });

            const tests = collection.mapTests('bro2', (test, browser) => ({test, browser}));

            assert.deepEqual(
                tests,
                [
                    {test: test2, browser: 'bro2'},
                    {test: test3, browser: 'bro2'}
                ]
            );
        });

        it('should map over all tests for all if browser not specified', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2, test3]
            });

            const tests = collection.mapTests((test, browser) => ({test, browser}));

            assert.deepEqual(
                tests,
                [
                    {test: test1, browser: 'bro1'},
                    {test: test2, browser: 'bro2'},
                    {test: test3, browser: 'bro2'}
                ]
            );
        });
    });

    describe('sortTests', () => {
        it('should do nothing if there are no tests for the specified browser', () => {
            const collection = TestCollection.create({
                'bro1': [],
                'bro2': []
            });

            collection.sortTests('bro1', (a, b) => a.title < b.title);

            assert.deepEqual(collection.mapTests('bro1', (t) => t), []);
            assert.deepEqual(collection.mapTests('bro2', (t) => t), []);
        });

        it('should sort all tests for the specified browser', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const collection = TestCollection.create({
                'bro1': [test1, test2, test3],
                'bro2': [test1, test2, test3]
            });

            collection.sortTests('bro1', (a, b) => a.title < b.title);

            assert.deepEqual(
                collection.mapTests('bro1', (test, browser) => ({test, browser})),
                [
                    {test: test3, browser: 'bro1'},
                    {test: test2, browser: 'bro1'},
                    {test: test1, browser: 'bro1'}
                ]
            );
            assert.deepEqual(
                collection.mapTests('bro2', (test, browser) => ({test, browser})),
                [
                    {test: test1, browser: 'bro2'},
                    {test: test2, browser: 'bro2'},
                    {test: test3, browser: 'bro2'}
                ]
            );
        });

        it('should sort all tests for all browsers if browser not specified', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const collection = TestCollection.create({
                'bro1': [test1, test2, test3],
                'bro2': [test1, test2, test3]
            });

            collection.sortTests((a, b) => a.title < b.title);

            assert.deepEqual(
                collection.mapTests('bro1', (test, browser) => ({test, browser})),
                [
                    {test: test3, browser: 'bro1'},
                    {test: test2, browser: 'bro1'},
                    {test: test1, browser: 'bro1'}
                ]
            );
            assert.deepEqual(
                collection.mapTests('bro2', (test, browser) => ({test, browser})),
                [
                    {test: test3, browser: 'bro2'},
                    {test: test2, browser: 'bro2'},
                    {test: test1, browser: 'bro2'}
                ]
            );
        });
    });

    describe('eachTestByVersions', () => {
        it('should iterate over tests according to browser version from config', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};
            const test4 = {title: 'test4'};

            const config = makeConfigStub({browsers: ['bro2'], version: '1.0'});
            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2, test3, test4]
            }, config);

            const tests = [];
            collection.eachTestByVersions(
                'bro2',
                (test, browserId, browserVersion) => tests.push({test, browserId, browserVersion})
            );

            assert.deepEqual(
                tests,
                [
                    {test: test2, browserId: 'bro2', browserVersion: '1.0'},
                    {test: test3, browserId: 'bro2', browserVersion: '1.0'},
                    {test: test4, browserId: 'bro2', browserVersion: '1.0'}
                ]
            );
        });

        it('should iterate over tests according only to browser version from test', () => {
            const test1 = {title: 'test1', browserVersion: '1.0'};
            const test2 = {title: 'test2', browserVersion: '1.0'};
            const test3 = {title: 'test3', browserVersion: '2.0'};
            const test4 = {title: 'test4', browserVersion: '2.0'};
            const test5 = {title: 'test5', browserVersion: '3.0'};

            const config = makeConfigStub({browsers: ['bro'], version: '23.2'});
            const collection = TestCollection.create({
                'bro': [test1, test2, test3, test4, test5]
            }, config);

            const tests = [];
            collection.eachTestByVersions(
                'bro',
                (test, browserId, browserVersion) => tests.push({test, browserId, browserVersion})
            );

            assert.deepEqual(
                tests,
                [
                    {test: test1, browserId: 'bro', browserVersion: '1.0'},
                    {test: test3, browserId: 'bro', browserVersion: '2.0'},
                    {test: test5, browserId: 'bro', browserVersion: '3.0'},
                    {test: test2, browserId: 'bro', browserVersion: '1.0'},
                    {test: test4, browserId: 'bro', browserVersion: '2.0'}
                ]
            );
        });

        it('should iterate over tests according to browser version from both test and config', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3', browserVersion: '2.0'};
            const test4 = {title: 'test4', browserVersion: '2.0'};

            const config = makeConfigStub({browsers: ['bro'], version: '1.0'});
            const collection = TestCollection.create({
                'bro': [test1, test2, test3, test4]
            }, config);

            const tests = [];
            collection.eachTestByVersions(
                'bro',
                (test, browserId, browserVersion) => tests.push({test, browserId, browserVersion})
            );

            assert.deepEqual(
                tests,
                [
                    {test: test1, browserId: 'bro', browserVersion: '1.0'},
                    {test: test3, browserId: 'bro', browserVersion: '2.0'},
                    {test: test2, browserId: 'bro', browserVersion: '1.0'},
                    {test: test4, browserId: 'bro', browserVersion: '2.0'}
                ]
            );
        });

        it('should iterate over tests if it\'s impossible to determine browser version', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const config = makeConfigStub({});
            const collection = TestCollection.create({
                'bro': [test1, test2, test3]
            }, config);

            const tests = [];
            collection.eachTestByVersions(
                'bro',
                (test, browserId, browserVersion) => tests.push({test, browserId, browserVersion})
            );

            assert.deepEqual(
                tests,
                [
                    {test: test1, browserId: 'bro', browserVersion: undefined},
                    {test: test2, browserId: 'bro', browserVersion: undefined},
                    {test: test3, browserId: 'bro', browserVersion: undefined}
                ]
            );
        });
    });

    describe('eachTest', () => {
        it('should iterate over tests for passed browser', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2, test3]
            });

            const tests = [];
            collection.eachTest('bro2', (test, browser) => tests.push({test, browser}));

            assert.deepEqual(
                tests,
                [
                    {test: test2, browser: 'bro2'},
                    {test: test3, browser: 'bro2'}
                ]
            );
        });

        it('should iterate over all tests for all if browser not specified', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2, test3]
            });

            const tests = [];
            collection.eachTest((test, browser) => tests.push({test, browser}));

            assert.deepEqual(
                tests,
                [
                    {test: test1, browser: 'bro1'},
                    {test: test2, browser: 'bro2'},
                    {test: test3, browser: 'bro2'}
                ]
            );
        });
    });

    describe('disableAll', () => {
        it('should disable all tests', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2, test3]
            });

            collection.disableAll();

            assert.deepEqual(
                collection.mapTests((t) => t),
                [
                    {title: 'test1', disabled: true},
                    {title: 'test2', disabled: true},
                    {title: 'test3', disabled: true}
                ]
            );
        });

        it('should disable all tests for specified browser', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};
            const test3 = {title: 'test3'};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2, test3]
            });

            collection.disableAll('bro1');

            assert.deepEqual(
                collection.mapTests('bro1', (t) => t),
                [
                    {title: 'test1', disabled: true}
                ]
            );
            assert.deepEqual(
                collection.mapTests('bro2', (t) => t),
                [
                    {title: 'test2'},
                    {title: 'test3'}
                ]
            );
        });

        it('should be chainable', () => {
            const collection = TestCollection.create({});

            assert.equal(collection.disableAll(), collection);
        });
    });

    describe('enableAll', () => {
        it('should do nothing for tests which were not disabled', () => {
            const test = {title: 'test'};

            const collection = TestCollection.create({
                'bro': [test]
            });

            collection.enableAll();

            assert.deepEqual(
                collection.mapTests((t) => t),
                [
                    {title: 'test'}
                ]
            );
        });

        it('should enable all previously disabled tests', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2]
            });

            collection.disableAll();
            collection.enableAll();

            assert.deepEqual(
                collection.mapTests((t) => t),
                [
                    {title: 'test1'},
                    {title: 'test2'}
                ]
            );
        });

        it('should not enable tests which were originally disabled', () => {
            const test = {title: 'test', disabled: true};

            const collection = TestCollection.create({
                'bro': [test]
            });

            collection.disableAll();
            collection.enableAll();

            assert.deepEqual(
                collection.mapTests((t) => t),
                [
                    {title: 'test', disabled: true}
                ]
            );
        });

        it('should enable all previously disabled tests for passed browser', () => {
            const test1 = {title: 'test1'};
            const test2 = {title: 'test2'};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2]
            });

            collection.disableAll();
            collection.enableAll('bro2');

            assert.deepEqual(
                collection.mapTests((t) => t),
                [
                    {title: 'test1', disabled: true},
                    {title: 'test2'}
                ]
            );
        });

        it('should be chainable', () => {
            const collection = TestCollection.create({});

            assert.equal(collection.enableAll(), collection);
        });
    });

    describe('disableTest', () => {
        it('should disable test in all browsers', () => {
            const collection = TestCollection.create({
                'bro1': [{fullTitle: () => 'foo bar'}],
                'bro2': [{fullTitle: () => 'foo bar'}]
            });

            collection.disableTest('foo bar');

            collection.eachTest((test) => {
                assert.equal(test.fullTitle(), 'foo bar');
                assert.include(test, {disabled: true});
            });
        });

        it('should disable test in specified browser', () => {
            const collection = TestCollection.create({
                'bro1': [{fullTitle: () => 'foo bar'}],
                'bro2': [{fullTitle: () => 'foo bar'}]
            });

            collection.disableTest('foo bar', 'bro1');

            collection.eachTest('bro1', (test) => assert.include(test, {disabled: true}));
            collection.eachTest('bro2', (test) => assert.notInclude(test, {disabled: true}));
        });

        it('should disable test in all browsers where it exists', () => {
            const collection = TestCollection.create({
                'bro1': [{fullTitle: () => 'foo bar'}],
                'bro2': [{fullTitle: () => 'baz qux'}]
            });

            collection.disableTest('foo bar');

            collection.eachTest('bro1', (test) => assert.include(test, {disabled: true}));
            collection.eachTest('bro2', (test) => assert.notInclude(test, {disabled: true}));
        });

        it('should be chainable', () => {
            const collection = TestCollection.create({});

            assert.equal(collection.disableTest(), collection);
        });
    });

    describe('enableTest', () => {
        it('should do nothing for tests which were not disabled', () => {
            const collection = TestCollection.create({
                'bro': [{fullTitle: () => 'foo bar'}]
            });

            collection
                .enableTest('foo bar')
                .enableTest('baz qux');

            collection.eachTest('bro', (test) => {
                assert.equal(test.fullTitle(), 'foo bar');
                assert.notInclude(test, {disabled: true});
            });
        });

        it('should enable test in all browsers', () => {
            const collection = TestCollection.create({
                'bro1': [{fullTitle: () => 'foo bar'}],
                'bro2': [{fullTitle: () => 'foo bar'}]
            });

            collection
                .disableAll()
                .enableTest('foo bar');

            collection.eachTest((test) => {
                assert.equal(test.fullTitle(), 'foo bar');
                assert.notInclude(test, {disabled: true});
            });
        });

        it('should enable previously disabled single test', () => {
            const collection = TestCollection.create({
                'bro': [{fullTitle: () => 'foo bar'}]
            });

            collection
                .disableTest('foo bar')
                .enableTest('foo bar');

            collection.eachTest('bro', (test) => assert.notInclude(test, {disabled: true}));
        });

        it('should enable test even if it was disabled twice', () => {
            const collection = TestCollection.create({
                'bro': [{fullTitle: () => 'foo bar'}]
            });

            collection
                .disableTest('foo bar')
                .disableTest('foo bar')
                .enableTest('foo bar');

            collection.eachTest('bro', (test) => assert.notInclude(test, {disabled: true}));
        });

        it('should enable test in specified browser', () => {
            const collection = TestCollection.create({
                'bro1': [{fullTitle: () => 'foo bar'}],
                'bro2': [{fullTitle: () => 'foo bar'}]
            });

            collection
                .disableAll()
                .enableTest('foo bar', 'bro1');

            collection.eachTest('bro1', (test) => assert.notInclude(test, {disabled: true}));
            collection.eachTest('bro2', (test) => assert.include(test, {disabled: true}));
        });

        it('should be chainable', () => {
            const collection = TestCollection.create({});

            assert.equal(collection.enableTest(), collection);
        });
    });

    describe('getRootSuite', () => {
        it('should return root suite for browser', () => {
            const root1 = {title: 'root1', root: true};
            const root2 = {title: 'root2', root: true};
            const test1 = {title: 'test1', parent: root1};
            const test2 = {title: 'test2', parent: {parent: root2}};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2]
            });

            assert.deepEqual(collection.getRootSuite('bro1'), root1);
            assert.deepEqual(collection.getRootSuite('bro2'), root2);
        });

        it('should return undefined if there are no tests for browser', () => {
            const collection = TestCollection.create({
                'bro': []
            });

            assert.isUndefined(collection.getRootSuite('bro'));
        });
    });

    describe('eachRootSuite', () => {
        it('should iterate over all root suites', () => {
            const root1 = {title: 'root1', root: true};
            const root2 = {title: 'root2', root: true};
            const test1 = {title: 'test1', parent: root1};
            const test2 = {title: 'test2', parent: {parent: root2}};

            const collection = TestCollection.create({
                'bro1': [test1],
                'bro2': [test2]
            });

            const rootSuites = {};
            collection.eachRootSuite((root, browser) => rootSuites[browser] = root);

            assert.deepEqual(rootSuites, {bro1: root1, bro2: root2});
        });

        it('should ignore root suites without tests', () => {
            const root = {title: 'root', root: true};
            const test = {title: 'test', parent: root};

            const collection = TestCollection.create({
                'bro1': [test],
                'bro2': []
            });

            const rootSuites = {};
            collection.eachRootSuite((root, browser) => rootSuites[browser] = root);

            assert.deepEqual(rootSuites, {bro1: root});
        });
    });
});
