import crashlytics from '@react-native-firebase/crashlytics';

class Log {
    private static instance: Log;

    private constructor() {}

    static getInstance(): Log {
        if (!Log.instance) {
            Log.instance = new Log();
        }
        return Log.instance;
    }

    error(tag: string, msg: string): void {
        const formatted = this.formatMsg(tag, msg)
        console.error(formatted)
        try {
            throw new Error(formatted)
        } catch (e) {
            crashlytics().recordError(e as Error)
        }
    }

    info(tag: string, msg: string): void {
        const formatted = this.formatMsg(tag, msg)
        console.info(formatted)
        crashlytics().log(formatted)
    }

    debug(tag: string, msg: string): void {
        const formatted = this.formatMsg(tag, msg)
        console.debug(formatted)
    }

    private formatMsg(tag: string, msg: string): string {
        return tag + ": " + msg
    }
}

export default Log.getInstance();
