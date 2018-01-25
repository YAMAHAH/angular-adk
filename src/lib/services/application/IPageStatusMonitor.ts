import Timer from './Timer';
import { IdleInfo } from './IdleInfo';
export interface IPageStatusMonitor {
    status: string;
    on(event: string, callback: (data: any) => any): IPageStatusMonitor;

    off(event: string, callback?: any): IPageStatusMonitor;

    setIdleDuration(seconds: number): IPageStatusMonitor;

    getIdleDuration(): number;

    getIdleInfo(): IdleInfo;

    idle(callback?: (data) => any): IPageStatusMonitor;

    blur(callback?: (data) => any): IPageStatusMonitor;

    focus(callback?: (data) => any): IPageStatusMonitor

    wakeup(callback?: (data) => any): IPageStatusMonitor;

    onEvery(seconds: number, callback: Function): Timer;
    now(check?: string): boolean;
}