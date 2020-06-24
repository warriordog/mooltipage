import { TestSet, TestCallback } from "../framework/testSet";
import { PipelineCache } from "../../lib/pipeline/pipelineCache";
import * as Assert from '../framework/assert';
import { Fragment } from "../../lib/pipeline/object/fragment";
import { DocumentNode } from '../../lib/dom/node';
import { EvalContent } from "../../lib/pipeline/evalEngine";

export class PipelineCacheTests implements TestSet {
    // test methods

    // fragment

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

    // template string

    private testTemplateStringHasPresent(): void {
        const cache = new PipelineCache();

        cache.storeTemplateString('foo', new EvalContent(() => 'foo'));
        const hasValue: boolean = cache.hasTemplateString('foo');

        Assert.IsTrue(hasValue);
    } 

    private testTemplateStringHasMissing(): void {
        const cache = new PipelineCache();

        const hasValue: boolean = cache.hasTemplateString('foo');

        Assert.IsFalse(hasValue);
    } 

    private testTemplateStringGetPresent(): void {
        const cache = new PipelineCache();
        const content = new EvalContent(() => 'foo');

        cache.storeTemplateString('foo', content);
        const value = cache.getTemplateString('foo');

        Assert.AreEqual(value, content);
    }
    
    private testTemplateStringGetMissing(): void {
        const cache = new PipelineCache();

        Assert.Throws(() => cache.getTemplateString('foo'));
    }

    private testTemplateStringOverwrite(): void {
        const cache = new PipelineCache();
        const content1 = new EvalContent(() => 'foo1');
        const content2 = new EvalContent(() => 'foo2');

        cache.storeTemplateString('foo', content1);
        cache.storeTemplateString('foo', content2);
        const value = cache.getTemplateString('foo');

        Assert.AreEqual(value, content2);
    }

    // template string

    private testHandlebarsHasPresent(): void {
        const cache = new PipelineCache();

        cache.storeHandlebars('foo', new EvalContent(() => 'foo'));
        const hasValue: boolean = cache.hasHandlebars('foo');

        Assert.IsTrue(hasValue);
    } 

    private testHandlebarsHasMissing(): void {
        const cache = new PipelineCache();

        const hasValue: boolean = cache.hasHandlebars('foo');

        Assert.IsFalse(hasValue);
    } 

    private testHandlebarsGetPresent(): void {
        const cache = new PipelineCache();
        const content = new EvalContent(() => 'foo');

        cache.storeHandlebars('foo', content);
        const value = cache.getHandlebars('foo');

        Assert.AreEqual(value, content);
    }
    
    private testHandlebarsGetMissing(): void {
        const cache = new PipelineCache();

        Assert.Throws(() => cache.getHandlebars('foo'));
    }

    private testHandlebarsOverwrite(): void {
        const cache = new PipelineCache();
        const content1 = new EvalContent(() => 'foo1');
        const content2 = new EvalContent(() => 'foo2');

        cache.storeHandlebars('foo', content1);
        cache.storeHandlebars('foo', content2);
        const value = cache.getHandlebars('foo');

        Assert.AreEqual(value, content2);
    }

    // general

    private testClear(): void {
        const cache = new PipelineCache();
        cache.storeFragment(new Fragment('foo', new DocumentNode()));
        cache.storeTemplateString('foo', new EvalContent(() => 'foo'));
        cache.storeHandlebars('foo', new EvalContent(() => 'foo'));

        cache.clear();

        Assert.IsFalse(cache.hasFragment('foo'));
        Assert.IsFalse(cache.hasTemplateString('foo'));
        Assert.IsFalse(cache.hasHandlebars('foo'));
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
            ['TemplateStringHasPresent', (): void => this.testTemplateStringHasPresent()],
            ['TemplateStringHasMissing', (): void => this.testTemplateStringHasMissing()],
            ['TemplateStringGetPresent', (): void => this.testTemplateStringGetPresent()],
            ['TemplateStringGetMissing', (): void => this.testTemplateStringGetMissing()],
            ['TemplateStringOverwrite', (): void => this.testTemplateStringOverwrite()],
            ['HandlebarsHasPresent', (): void => this.testHandlebarsHasPresent()],
            ['HandlebarsHasMissing', (): void => this.testHandlebarsHasMissing()],
            ['HandlebarsGetPresent', (): void => this.testHandlebarsGetPresent()],
            ['HandlebarsGetMissing', (): void => this.testHandlebarsGetMissing()],
            ['HandlebarsOverwrite', (): void => this.testHandlebarsOverwrite()],
            ['Clear', (): void => this.testClear()]
        ]);
    }
}