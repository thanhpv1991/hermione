/// <reference types='mocha' />

declare namespace Hermione {
    export interface MochaSuite extends Mocha.ISuite {}
    export interface MochaTest extends Mocha.ITest {}
}
