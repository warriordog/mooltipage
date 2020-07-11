import { TestSet, TestCallback } from "../framework/testSet";
import { UsageContext } from "../../lib/pipeline/usageContext";
import * as Assert from '../framework/assert';
import { DocumentNode } from '../../lib/dom/node';
import { Page } from "../../lib/pipeline/object/page";

export class UsageContextTests implements TestSet {
    // test methods

    private testConstructorPage(): void {
        const page: Page = new Page('123', new DocumentNode());
        const usage: UsageContext = new UsageContext(page);

        Assert.IsNotNullish(usage.currentPage);
        Assert.IsNotNullish(usage.slotContents);
        Assert.IsEmpty(usage.slotContents);
    }

    private testConstructorUndefSlots(): void {
        const page: Page = new Page('123', new DocumentNode());
        const usage: UsageContext = new UsageContext(page, undefined);

        Assert.IsNotNullish(usage.slotContents);
        Assert.IsEmpty(usage.slotContents);
    }

    private testConstructorValidSlots(): void {
        const page: Page = new Page('123', new DocumentNode());
        const slotContents: Map<string, DocumentNode> = new Map<string, DocumentNode>([
            ['a', new DocumentNode()],
            ['foo', new DocumentNode()]
        ]);

        const usage: UsageContext = new UsageContext(page, slotContents);

        Assert.IsNotNullish(usage.slotContents);
        Assert.IsNotEmpty(usage.slotContents);
        Assert.AreEqual(2, usage.slotContents.size);
        Assert.IsTrue(usage.slotContents.has('a'));
        Assert.IsTrue(usage.slotContents.has('foo'));
    }

    private testConstructorUndefParams(): void {
        const page: Page = new Page('123', new DocumentNode());
        const usage: UsageContext = new UsageContext(page, undefined, undefined);

        Assert.IsNotNullish(usage.fragmentParams);
        Assert.IsEmpty(usage.fragmentParams)
    }

    private testConstructorValidParams(): void {
        const page: Page = new Page('123', new DocumentNode());
        const fragmentParams: Map<string, unknown> = new Map([
            ['key1', 'val1'],
            ['key2', 'val2']
        ]);

        const usage: UsageContext = new UsageContext(page, undefined, fragmentParams);

        Assert.IsNotNullish(usage.fragmentParams);
        Assert.IsNotEmpty(usage.fragmentParams);
        Assert.AreEqual(2, usage.fragmentParams.size);
        Assert.IsTrue(usage.fragmentParams.has('key1'));
        Assert.IsTrue(usage.fragmentParams.has('key2'));
    }

    // test set boilerplate
    readonly setName: string = 'UsageContext';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['ConstructorPage', (): void => this.testConstructorPage()],
            ['ConstructorUndefSlots', (): void => this.testConstructorUndefSlots()],
            ['ConstructorValidSlots', (): void => this.testConstructorValidSlots()],
            ['ConstructorUndefParams', (): void => this.testConstructorUndefParams()],
            ['ConstructorValidParams', (): void => this.testConstructorValidParams()]
        ]);
    }
}