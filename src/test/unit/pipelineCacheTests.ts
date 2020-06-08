import { TestSet, TestCallback } from "../framework/testSet";
import { PipelineCache } from "../../lib/pipeline/pipelineCache";
import * as Assert from '../framework/assert';
import { Fragment } from "../../lib/pipeline/fragment";
import { Page } from "../../lib/pipeline/page";
import { DocumentNode } from '../../lib/dom/node';

export class PipelineCacheTests implements TestSet {
    // test methods

    private testFragHasPresent(): void {
        const cache = new PipelineCache();

        cache.storeFragment(new Fragment('foo', new DocumentNode()));
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
        const frag = new Fragment('foo', new DocumentNode());

        cache.storeFragment(frag);
        const value: Fragment = cache.getFragment('foo');

        Assert.AreEqual(value, frag);
    }
    
    private testFragGetMissing(): void {
        const cache = new PipelineCache();

        Assert.Throws(() => cache.getFragment('foo'));
    }

    private testFragOverwrite(): void {
        const cache = new PipelineCache();
        const frag1 = new Fragment('foo', new DocumentNode());
        const frag2 = new Fragment('foo', new DocumentNode());

        cache.storeFragment(frag1);
        cache.storeFragment(frag2);
        const value: Fragment = cache.getFragment('foo');

        Assert.AreEqual(value, frag2);
    }

    private testPageHasPresent(): void {
        const cache = new PipelineCache();

        cache.storePage(new Page('foo', new DocumentNode()));
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
        const page = new Page('foo', new DocumentNode());

        cache.storePage(page);
        const value: Page = cache.getPage('foo');

        Assert.AreEqual(value, page);
    }
    
    private testPageGetMissing(): void {
        const cache = new PipelineCache();

        Assert.Throws(() => cache.getPage('foo'));
    }

    private testPageOverwrite(): void {
        const cache = new PipelineCache();
        const page1 = new Page('value1', new DocumentNode());
        const page2 = new Page('value1', new DocumentNode());

        cache.storePage(page1);
        cache.storePage(page2);
        const value: Page = cache.getPage('value1');

        Assert.AreEqual(value, page2);
    }

    private testClear(): void {
        const cache = new PipelineCache();
        cache.storePage(new Page('res1', new DocumentNode()));
        cache.storeFragment(new Fragment('res2', new DocumentNode()));

        cache.clear();

        Assert.IsFalse(cache.hasPage('res1'));
        Assert.IsFalse(cache.hasFragment('res2'));
    }

    // test set boilerplate
    readonly setName: string = 'PipelineCacheTests';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['FragHasPresent', (): void => this.testFragHasPresent()],
            ['FragHasMissing', (): void => this.testFragHasMissing()],
            ['FragGetPresent', (): void => this.testFragGetPresent()],
            ['FragGetMissing', (): void => this.testFragGetMissing()],
            ['FragOverwrite', (): void => this.testFragOverwrite()],
            ['PageHasPresent', (): void => this.testPageHasPresent()],
            ['PageHasMissing', (): void => this.testPageHasMissing()],
            ['PageGetPresent', (): void => this.testPageGetPresent()],
            ['PageGetMissing', (): void => this.testPageGetMissing()],
            ['PageOverwrite', (): void => this.testPageOverwrite()],
            ['Clear', (): void => this.testClear()]
        ]);
    }
}