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

export function IsEmpty(value: ArrayLike<any>): void;
export function IsEmpty(value: Map<any, any>): void;
export function IsEmpty(value: string): void;
export function IsEmpty(value: any): void {
    if (value != null) {
        if (value.length !== undefined && value.length > 0) {
            RaiseError('IsEmpty', value);
        }
        if (value.size !== undefined && value.size > 0) {
            RaiseError('IsEmpty', value);
        }
    }
}
export function IsNotEmpty(value: ArrayLike<any>): void;
export function IsNotEmpty(value: Map<any, any>): void;
export function IsNotEmpty(value: string): void;
export function IsNotEmpty(value: any): void {
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

function RaiseError(assertionName: string, actual?: any, expected?: any): void {
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