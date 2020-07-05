import { TestSet, TestCallback } from "../framework/testSet";
import { PipelineCache } from "../../lib/pipeline/pipelineCache";
import * as Assert from '../framework/assert';
import { Fragment } from "../../lib/pipeline/object/fragment";
import { DocumentNode } from '../../lib/dom/node';
import { EvalContentFunction } from "../../lib/pipeline/evalEngine";
import { Page } from "../../lib/pipeline/object/page";
import { Component, ComponentTemplate, ComponentScript, ComponentScriptType } from "../../lib/pipeline/object/component";

export class PipelineCacheTests implements TestSet {
    // test methods

    // page

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
        const frag = new Page('foo', new DocumentNode());

        cache.storePage(frag);
        const value: Page = cache.getPage('foo');

        Assert.AreEqual(value, frag);
    }

    private testPageGetMissing(): void {
        const cache = new PipelineCache();

        Assert.Throws(() => cache.getPage('foo'));
    }

    private testPageOverwrite(): void {
        const cache = new PipelineCache();
        const frag1 = new Page('foo', new DocumentNode());
        const frag2 = new Page('foo', new DocumentNode());

        cache.storePage(frag1);
        cache.storePage(frag2);
        const value: Page = cache.getPage('foo');

        Assert.AreEqual(value, frag2);
    }
    
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


    
    // component

    private testCompHasPresent(): void {
        const cache = new PipelineCache();
        const temp = new ComponentTemplate(new DocumentNode());
        const script = new ComponentScript(ComponentScriptType.FUNCTION, new EvalContentFunction(() => { return {} }))
        const comp = new Component('foo', temp, script);

        cache.storeComponent(comp);
        const hasValue: boolean = cache.hasComponent('foo');

        Assert.IsTrue(hasValue);
    } 

    private testCompHasMissing(): void {
        const cache = new PipelineCache();

        const hasValue: boolean = cache.hasComponent('foo');

        Assert.IsFalse(hasValue);
    } 

    private testCompGetPresent(): void {
        const cache = new PipelineCache();
        const temp = new ComponentTemplate(new DocumentNode());
        const script = new ComponentScript(ComponentScriptType.FUNCTION, new EvalContentFunction(() => { return {} }))
        const comp = new Component('foo', temp, script);

        cache.storeComponent(comp);
        const value: Component = cache.getComponent('foo');

        Assert.AreEqual(value, comp);
    }
    
    private testCompGetMissing(): void {
        const cache = new PipelineCache();

        Assert.Throws(() => cache.getComponent('foo'));
    }

    private testCompOverwrite(): void {
        const cache = new PipelineCache();
        const temp = new ComponentTemplate(new DocumentNode());
        const script = new ComponentScript(ComponentScriptType.FUNCTION, new EvalContentFunction(() => { return {} }))
        const comp1 = new Component('foo', temp, script);
        const comp2 = new Component('foo', temp, script);

        cache.storeComponent(comp1);
        cache.storeComponent(comp2);
        const value: Component = cache.getComponent('foo');

        Assert.AreEqual(value, comp2);
    }

    // template string

    private testTemplateStringHasPresent(): void {
        const cache = new PipelineCache();

        cache.storeTemplateString('foo', new EvalContentFunction(() => 'foo'));
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
        const content = new EvalContentFunction(() => 'foo');

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
        const content1 = new EvalContentFunction(() => 'foo1');
        const content2 = new EvalContentFunction(() => 'foo2');

        cache.storeTemplateString('foo', content1);
        cache.storeTemplateString('foo', content2);
        const value = cache.getTemplateString('foo');

        Assert.AreEqual(value, content2);
    }

    // handlebars

    private testHandlebarsHasPresent(): void {
        const cache = new PipelineCache();

        cache.storeHandlebars('foo', new EvalContentFunction(() => 'foo'));
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
        const content = new EvalContentFunction(() => 'foo');

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
        const content1 = new EvalContentFunction(() => 'foo1');
        const content2 = new EvalContentFunction(() => 'foo2');

        cache.storeHandlebars('foo', content1);
        cache.storeHandlebars('foo', content2);
        const value = cache.getHandlebars('foo');

        Assert.AreEqual(value, content2);
    }

    // general

    private testClear(): void {
        const cache = new PipelineCache();
        cache.storeFragment(new Fragment('foo', new DocumentNode()));
        cache.storeTemplateString('foo', new EvalContentFunction(() => 'foo'));
        cache.storeHandlebars('foo', new EvalContentFunction(() => 'foo'));

        cache.clear();

        Assert.IsFalse(cache.hasFragment('foo'));
        Assert.IsFalse(cache.hasTemplateString('foo'));
        Assert.IsFalse(cache.hasHandlebars('foo'));
    }

    // test set boilerplate
    readonly setName: string = 'PipelineCache';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['PageHasPresent', (): void => this.testPageHasPresent()],
            ['PageHasMissing', (): void => this.testPageHasMissing()],
            ['PageGetPresent', (): void => this.testPageGetPresent()],
            ['PageGetMissing', (): void => this.testPageGetMissing()],
            ['PageOverwrite', (): void => this.testPageOverwrite()],
            ['FragHasPresent', (): void => this.testFragHasPresent()],
            ['FragHasMissing', (): void => this.testFragHasMissing()],
            ['FragGetPresent', (): void => this.testFragGetPresent()],
            ['FragGetMissing', (): void => this.testFragGetMissing()],
            ['FragOverwrite', (): void => this.testFragOverwrite()],
            ['CompgHasPresent', (): void => this.testCompHasPresent()],
            ['CompHasMissing', (): void => this.testCompHasMissing()],
            ['CompGetPresent', (): void => this.testCompGetPresent()],
            ['CompGetMissing', (): void => this.testCompGetMissing()],
            ['CompOverwrite', (): void => this.testCompOverwrite()],
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