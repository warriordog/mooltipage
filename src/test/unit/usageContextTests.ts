import { TestSet, TestCallback } from "../framework/testSet";
import { UsageContext } from "../../lib/pipeline/usageContext";
import * as Assert from '../framework/assert';
import { DocumentNode as DOM } from '../../lib/dom/node';

export default class UsageContextTests implements TestSet {
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
        const slotContents: Map<string, DOM> = new Map<string, DOM>([
            ['a', new DOM()],
            ['foo', new DOM()]
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
            ['testConstructorNoArgs', (): void => this.testConstructorNoArgs()],
            ['testConstructorUndefArgs', (): void => this.testConstructorUndefArgs()],
            ['testConstructorValidArgs', (): void => this.testConstructorValidArgs()]
        ]);
    }
}