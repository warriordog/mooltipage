import { TestSet, TestCallback } from "../framework/testSet";
import { PipelineCache } from "../../lib/pipeline/pipelineCache";
import * as Assert from '../framework/assert';
import { Fragment } from "../../lib/pipeline/fragment";
import { Page } from "../../lib/pipeline/page";
import { DocumentNode as DOM } from '../../lib/dom/node';

export default class PipelineCacheTests implements TestSet {
    // test methods

    private testFragHasPresent(): void {
        const cache = new PipelineCache();

        cache.storeFragment('foo', new Fragment('foo', new DOM()));
        const hasValue: boolean = cache.hasFragment('foo');

        Assert.IsTrue(hasValue);
    } 

    private testFragHasMissing(): void {
        const cache = new PipelineCache();

        const hasValue: boolean = cache.hasFragment('foo');

        Assert.IsFalse(hasValue);
    } 

    private testFragGetPresent(): void {
        const cache = new PipelineCache();
        const frag = new Fragment('foo', new DOM());

        cache.storeFragment('foo', frag);
        const value: Fragment = cache.getFragment('foo');

        Assert.AreEqual(value, frag);
    }
    
    private testFragGetMissing(): void {
        const cache = new PipelineCache();

        Assert.Throws(() => cache.getFragment('foo'));
    }

    private testFragOverwrite(): void {
        const cache = new PipelineCache();
        const frag1 = new Fragment('value1', new DOM());
        const frag2 = new Fragment('value2', new DOM());

        cache.storeFragment('foo', frag1);
        cache.storeFragment('foo', frag2);
        const value: Fragment = cache.getFragment('foo');

        Assert.AreEqual(value, frag2);
    }

    private testPageHasPresent(): void {
        const cache = new PipelineCache();

        cache.storePage('foo', new Page('foo', new DOM()));
        const hasValue: boolean = cache.hasPage('foo');

        Assert.IsTrue(hasValue);
    } 

    private testPageHasMissing(): void {
        const cache = new PipelineCache();

        const hasValue: boolean = cache.hasPage('foo');

        Assert.IsFalse(hasValue);
    } 

    private testPageGetPresent(): void {
        const cache = new PipelineCache();
        const page = new Page('foo', new DOM());

        cache.storePage('foo', page);
        const value: Page = cache.getPage('foo');

        Assert.AreEqual(value, page);
    }
    
    private testPageGetMissing(): void {
        const cache = new PipelineCache();

        Assert.Throws(() => cache.getPage('foo'));
    }

    private testPageOverwrite(): void {
        const cache = new PipelineCache();
        const page1 = new Page('value1', new DOM());
        const page2 = new Page('value2', new DOM());

        cache.storePage('foo', page1);
        cache.storePage('foo', page2);
        const value: Page = cache.getPage('foo');

        Assert.AreEqual(value, page2);
    }

    // test set boilerplate
    readonly setName: string = 'PipelineCacheTests';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['testFragHasPresent', (): void => this.testFragHasPresent()],
            ['testFragHasMissing', (): void => this.testFragHasMissing()],
            ['testFragGetPresent', (): void => this.testFragGetPresent()],
            ['testFragGetMissing', (): void => this.testFragGetMissing()],
            ['testFragOverwrite', (): void => this.testFragOverwrite()],
            ['testPageHasPresent', (): void => this.testPageHasPresent()],
            ['testPageHasMissing', (): void => this.testPageHasMissing()],
            ['testPageGetPresent', (): void => this.testPageGetPresent()],
            ['testPageGetMissing', (): void => this.testPageGetMissing()],
            ['testPageOverwrite', (): void => this.testPageOverwrite()]
        ]);
    }
}