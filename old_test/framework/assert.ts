export function AreEqual<T>(expected: T, actual: T): void {
    if (expected !== actual) {
        RaiseError('AreEqual', actual, expected);
    }
}

export function AreEqualish<T>(expected: T, actual: T): void {
    if (expected != actual) {
        RaiseError('AreEqualish', actual, expected);
    }
}

export function IsNull(value: unknown): void {
    if (value !== null) {
        RaiseError('IsNull', value);
    }
}

export function IsNotNull(value: unknown): void {
    if (value === null) {
        RaiseError('IsNotNull', value);
    }
}

export function IsNullish(value: unknown): void {
    if (value != null) {
        RaiseError('IsNullish', value);
    }
}

export function IsNotNullish(value: unknown): void {
    if (value == null) {
        RaiseError('IsNotNullish', value);
    }
}

export function IsUndefined(value: unknown): void {
    if (value !== undefined) {
        RaiseError('IsUndefined', value);
    }
}

export function IsNotUndefined(value: unknown): void {
    if (value === undefined) {
        RaiseError('IsNotUndefined', value);
    }
}

export function IsTrue(value: boolean): void {
    if (value !== true) {
        RaiseError('IsTrue', value);
    }
}

export function IsFalse(value: boolean): void {
    if (value !== false) {
        RaiseError('IsFalse', value);
    }
}

export function IsTruthy(value: boolean): void {
    if (!value) {
        RaiseError('IsTruthy', value);
    }
}

export function IsFalsy(value: boolean): void {
    if (value) {
        RaiseError('IsFalsy', value);
    }
}

export function IsEmpty(value: Sizable): void {
    if (value != null) {
        if (value.length !== undefined && value.length > 0) {
            RaiseError('IsEmpty', value);
        }
        if (value.size !== undefined && value.size > 0) {
            RaiseError('IsEmpty', value);
        }
    }
}

export function IsNotEmpty(value: Sizable): void {
    if (value == null) {
        RaiseError('IsNotEmpty', value);
    }
    if (value.length !== undefined && value.length === 0) {
        RaiseError('IsNotEmpty', value);
    }
    if (value.size !== undefined && value.size === 0) {
        RaiseError('IsNotEmpty', value);
    }
}

export function Throws(callback: () => void): void {
    try {
        callback();
        RaiseError('Throws');
    } catch (e) {
        // success
    }
}

function RaiseError(assertionName: string, actual?: unknown, expected?: unknown): void {
    if (actual != undefined) {
        if (expected != undefined) {
            throw new Error(`AssertionError: ${assertionName} failed.  Expected: ${expected}.  Actual: ${actual}.`);
        } else {
            throw new Error(`AssertionError: ${assertionName} failed.  Value: ${actual}.`);
        }
    } else {
        throw new Error(`AssertionError: ${assertionName} failed.`);
    }
}

export interface Sizable {
    length?: number;
    size?: number;
}