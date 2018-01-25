import { IPageStatusMonitor } from './IPageStatusMonitor';
import { STATUS_ACTIVE } from './StatusConsts';

export default class Timer {
    private token: number;
    stopped: boolean = false;

    constructor(private pageStatusMonitor: IPageStatusMonitor,
        private seconds: number,
        private callback: Function) {
        this.start();

        this.pageStatusMonitor.on("statusChanged", (data: any) => {
            if (this.stopped === false) {
                if (data.status === STATUS_ACTIVE) {
                    this.start();
                } else {
                    this.pause();
                }
            }
        });
    }

    private start() {
        this.stopped = false;
        clearInterval(this.token);
        this.token = setInterval(this.callback, this.seconds * 1000);
    }

    public stop() {
        this.stopped = true;
        clearInterval(this.token);
    }

    public resume() {
        this.start();
    }

    public pause() {
        this.stop();
    }
}