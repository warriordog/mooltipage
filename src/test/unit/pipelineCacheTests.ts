import { TestSet, TestCallback } from "../framework/testSet";
import { PipelineCache } from "../../lib/compiler/pipeline";
import * as Assert from '../framework/assert';

export default class PipelineCacheTests implements TestSet {
    // test methods

    private testHasPresent(): void {
        const cache = new PipelineCache<string>();

        cache.storeFragment('foo', 'foovalue');
        const hasValue: boolean = cache.hasFragment('foo');

        Assert.IsTrue(hasValue);
    } 

    private testHasMissing(): void {
        const cache = new PipelineCache<string>();

        const hasValue: boolean = cache.hasFragment('foo');

        Assert.IsFalse(hasValue);
    } 

    private testGetPresent(): void {
        const cache = new PipelineCache<string>();

        cache.storeFragment('foo', 'foovalue');
        const value: string = cache.getFragment('foo');

        Assert.AreEqual(value, 'foovalue');
    }
    
    private testGetMissing(): void {
        const cache = new PipelineCache<string>();

        Assert.Throws(() => cache.getFragment('foo'));
    }

    private testOverwrite(): void {
        const cache = new PipelineCache<string>();

        cache.storeFragment('foo', 'value1');
        cache.storeFragment('foo', 'value2');
        const value: string = cache.getFragment('foo');

        Assert.AreEqual(value, 'value2');
    }

    // test set boilerplate
    readonly setName: string = 'PipelineCacheTests';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['testHasPresent', (): void => this.testHasPresent()],
            ['testHasMissing', (): void => this.testHasMissing()],
            ['testGetPresent', (): void => this.testGetPresent()],
            ['testGetMissing', (): void => this.testGetMissing()],
            ['testOverwrite', (): void => this.testOverwrite()]
        ]);
    }
}