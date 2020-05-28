export default new class Assert {
    AreEqual<T>(actual: T, expected: T): void {
        if (expected != actual) {
            this.RaiseError('AreEqual', actual, expected);
        }
    }

    AreEqualish<T>(actual: T, expected: T): void {
        if (expected !== actual) {
            this.RaiseError('AreEqualish', actual, expected);
        }
    }

    IsNull(value: any): void {
        if (value !== null) {
            this.RaiseError('IsNull', value);
        }
    }

    IsNotNull(value: any): void {
        if (value === null) {
            this.RaiseError('IsNotNull', value);
        }
    }

    IsNullish(value: any): void {
        if (value != null) {
            this.RaiseError('IsNullish', value);
        }
    }

    IsNotNullish(value: any): void {
        if (value == null) {
            this.RaiseError('IsNotNullish', value);
        }
    }

    IsUndefined(value: any): void {
        if (value !== undefined) {
            this.RaiseError('IsUndefined', value);
        }
    }

    IsNotUndefined(value: any): void {
        if (value === undefined) {
            this.RaiseError('IsNotUndefined', value);
        }
    }

    IsTrue(value: boolean): void {
        if (value !== true) {
            this.RaiseError('IsTrue', value);
        }
    }

    IsFalse(value: boolean): void {
        if (value !== false) {
            this.RaiseError('IsFalse', value);
        }
    }

    IsTruthy(value: boolean): void {
        if (!value) {
            this.RaiseError('IsTruthy', value);
        }
    }

    IsFalsy(value: boolean): void {
        if (value) {
            this.RaiseError('IsFalsy', value);
        }
    }

    private RaiseError(assertionName: string, actual: any, expected?: any): void {
        if (expected != undefined) {
            throw new Error(`AssertionError: ${assertionName} failed.  Expected: ${new String(expected)}.  Actual: ${new String(actual)}.`);
        } else {
            throw new Error(`AssertionError: ${assertionName} failed.  Value: ${new String(actual)}.`);
        }
    }
}