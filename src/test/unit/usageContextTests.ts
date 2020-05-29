import { TestSet, TestCallback } from "../framework/testSet";
import { UsageContext } from "../../lib/compiler/pipeline";
import * as Assert from '../framework/assert';

export default class UsageContextTests implements TestSet {
    // test methods

    private testConstructorNoArgs(): void {
        const usage: UsageContext<string> = new UsageContext<string>();

        Assert.IsNotNullish(usage.slotContents);
        Assert.IsEmpty(usage.slotContents);
    }

    private testConstructorUndefArgs(): void {
        const usage: UsageContext<string> = new UsageContext<string>(undefined);

        Assert.IsNotNullish(usage.slotContents);
        Assert.IsEmpty(usage.slotContents);
    }

    private testConstructorValidArgs(): void {
        const slotContents: Map<string, Array<string>> = new Map<string, Array<string>>([
            ['a', ['b']],
            ['foo', ['bar', 'zaz']]
        ]);

        const usage: UsageContext<string> = new UsageContext<string>(slotContents);

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
            ['testConstructorNoArgs', () => this.testConstructorNoArgs()],
            ['testConstructorUndefArgs', () => this.testConstructorUndefArgs()],
            ['testConstructorValidArgs', () => this.testConstructorValidArgs()]
        ]);
    }
}