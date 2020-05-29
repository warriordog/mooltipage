export function AreEqual<T>(actual: T, expected: T): void {
    if (expected !== actual) {
        RaiseError('AreEqual', actual, expected);
    }
}

export function AreEqualish<T>(actual: T, expected: T): void {
    if (expected != actual) {
        RaiseError('AreEqualish', actual, expected);
    }
}

export function IsNull(value: any): void {
    if (value !== null) {
        RaiseError('IsNull', value);
    }
}

export function IsNotNull(value: any): void {
    if (value === null) {
        RaiseError('IsNotNull', value);
    }
}

export function IsNullish(value: any): void {
    if (value != null) {
        RaiseError('IsNullish', value);
    }
}

export function IsNotNullish(value: any): void {
    if (value == null) {
        RaiseError('IsNotNullish', value);
    }
}

export function IsUndefined(value: any): void {
    if (value !== undefined) {
        RaiseError('IsUndefined', value);
    }
}

export function IsNotUndefined(value: any): void {
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

export function IsEmpty(value: ArrayLike<any> | null | undefined) {
    if (!(value == null || value.length === 0)) {
        RaiseError('IsEmpty', value);
    }
}

export function IsNotEmpty(value: ArrayLike<any> | null | undefined) {
    if (value == null || value.length === 0) {
        RaiseError('IsNotEmpty', value);
    }
}

function RaiseError(assertionName: string, actual: any, expected?: any): void {
    if (expected != undefined) {
        throw new Error(`AssertionError: ${assertionName} failed.  Expected: ${expected}.  Actual: ${actual}.`);
    } else {
        throw new Error(`AssertionError: ${assertionName} failed.  Value: ${actual}.`);
    }
}