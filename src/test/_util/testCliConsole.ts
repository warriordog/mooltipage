import {CliConsole} from '../../bin';
import os
    from 'os';

export type OnLogCallback = (message: unknown) => void;

export class TestCliConsole implements CliConsole {
    logs: string[] = [];
    onLogCallbacks: OnLogCallback[] = [];
    onErrorCallbacks: OnLogCallback[] = [];

    log(message?: unknown): void {
        if (message === undefined) {
            message = os.EOL;
        }
        this.logs.push(String(message));
        this.onLogCallbacks.forEach(lc => lc(message));
    }

    error(message?: unknown): void {
        this.log(message);
        this.onErrorCallbacks.forEach(ec => ec(message));
    }

    waitForLog(matcher: (message: unknown) => boolean): Promise<unknown> {
        return new Promise<unknown>((resolve => {
            this.onLogCallbacks.push((message: unknown) => {
                if (matcher(message)) {
                    resolve(message);
                }
            });
        }));
    }
}