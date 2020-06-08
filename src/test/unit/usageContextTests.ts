import { TestSet, TestCallback } from "../framework/testSet";
import { UsageContext } from "../../lib/pipeline/usageContext";
import * as Assert from '../framework/assert';
import { DocumentNode } from '../../lib/dom/node';

export class UsageContextTests implements TestSet {
    // test methods

    private testConstructorNoArgs(): void {
        const usage: UsageContext = new UsageContext();

        Assert.IsNotNullish(usage.slotContents);
        Assert.IsEmpty(usage.slotContents);
    }

    private testConstructorUndefArgs(): void {
        const usage: UsageContext = new UsageContext(undefined);

        Assert.IsNotNullish(usage.slotContents);
        Assert.IsEmpty(usage.slotContents);
    }

    private testConstructorValidArgs(): void {
        const slotContents: Map<string, DocumentNode> = new Map<string, DocumentNode>([
            ['a', new DocumentNode()],
            ['foo', new DocumentNode()]
        ]);

        const usage: UsageContext = new UsageContext(slotContents);

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
            ['ConstructorNoArgs', (): void => this.testConstructorNoArgs()],
            ['ConstructorUndefArgs', (): void => this.testConstructorUndefArgs()],
            ['ConstructorValidArgs', (): void => this.testConstructorValidArgs()]
        ]);
    }
}