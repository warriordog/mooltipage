import { TestSet, TestCallback } from "../framework/testSet";
import { UsageContext } from "../../lib/pipeline/usageContext";
import * as Assert from '../framework/assert';
import { DocumentNode } from '../../lib/dom/node';

export class UsageContextTests implements TestSet {
    // test methods

    private testConstructorPage(): void {
        const usage: UsageContext = new UsageContext(true);

        Assert.IsTrue(usage.isPage);
        Assert.IsNotNullish(usage.slotContents);
        Assert.IsEmpty(usage.slotContents);
    }

    private testConstructorUndefSlots(): void {
        const usage: UsageContext = new UsageContext(false, undefined);

        Assert.IsNotNullish(usage.slotContents);
        Assert.IsEmpty(usage.slotContents);
    }

    private testConstructorValidSlots(): void {
        const slotContents: Map<string, DocumentNode> = new Map<string, DocumentNode>([
            ['a', new DocumentNode()],
            ['foo', new DocumentNode()]
        ]);

        const usage: UsageContext = new UsageContext(false, slotContents);

        Assert.IsNotNullish(usage.slotContents);
        Assert.IsNotEmpty(usage.slotContents);
        Assert.AreEqual(usage.slotContents.size, 2);
        Assert.IsTrue(usage.slotContents.has('a'));
        Assert.IsTrue(usage.slotContents.has('foo'));
    }

    // test set boilerplate
    readonly setName: string = 'UsageContextTests';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['ConstructorPage', (): void => this.testConstructorPage()],
            ['ConstructorUndefSlots', (): void => this.testConstructorUndefSlots()],
            ['ConstructorValidSlots', (): void => this.testConstructorValidSlots()]
        ]);
    }
}