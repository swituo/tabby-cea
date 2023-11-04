import deepClone from 'clone-deep'
import { Logger } from 'tabby-core'
import { SessionMiddleware } from '../api/middleware'
import totp from "totp-generator";

export interface LoginScript {
    expect: string
    send: string
    isRegex?: boolean
    optional?: boolean
}

export interface LoginScriptsOptions {
    scripts?: LoginScript[]
}

export class LoginScriptProcessor extends SessionMiddleware {
    private remainingScripts: LoginScript[] = []

    private escapeSeqMap = {
        a: '\x07',
        b: '\x08',
        e: '\x1b',
        f: '\x0c',
        n: '\x0a',
        r: '\x0d',
        t: '\x09',
        v: '\x0b',
    }

    // 特殊脚本语法
    private readonly CUSTOM_SCRIPT_REGEXP: Map<string, RegExp> = new Map([
        [ "TOTP", /^\$\{\{TOTP::(?<secret>.*?)\}\}$/ ]
    ]);

    constructor (
        private logger: Logger,
        options: LoginScriptsOptions,
    ) {
        super()
        this.remainingScripts = deepClone(options.scripts ?? [])
        for (const script of this.remainingScripts) {
            if (!script.isRegex) {
                script.expect = this.unescape(script.expect)
            }
            script.send = this.unescape(script.send)
        }
    }


    // 执行自定义脚本
    parseCustomScriptSend (sendText: string): string | null {
        if (sendText) {
            let parseResult : string | null = null;
            for (let item of this.CUSTOM_SCRIPT_REGEXP.entries()) {
                const matcher = sendText.match(item[1]);
                if (matcher) {
                    switch (item[0]) {
                        case "TOTP":
                            parseResult = matcher.groups ? totp(matcher.groups["secret"]) : null;
                            break;
                    }
                }
                if (parseResult) {
                    break;
                }
            }
            return parseResult;
        }
        return null;
    }


    feedFromSession (data: Buffer): void {
        const dataString = data.toString()

        for (const script of this.remainingScripts) {
            if (!script.expect) {
                continue
            }
            let match = false
            if (script.isRegex) {
                const re = new RegExp(script.expect, 'g')
                match = re.test(dataString)
            } else {
                match = dataString.includes(script.expect)
            }

            if (match) {
                // 自定义脚本
                const customSend = this.parseCustomScriptSend(script.send);
                const sendContent = customSend ? customSend : script.send;
                this.logger.info('Executing script:', script)
                // this.outputToSession.next(Buffer.from(script.send + '\n'))
                this.outputToSession.next(Buffer.from(sendContent + '\n'))
                this.remainingScripts = this.remainingScripts.filter(x => x !== script)
            } else {
                if (script.optional) {
                    this.logger.debug('Skip optional script: ' + script.expect)
                    this.remainingScripts = this.remainingScripts.filter(x => x !== script)
                } else {
                    break
                }
            }
        }

        super.feedFromSession(data)
    }

    executeUnconditionalScripts (): void {
        for (const script of this.remainingScripts) {
            if (!script.expect) {
                // 自定义脚本
                const customSend = this.parseCustomScriptSend(script.send);
                const sendContent = customSend ? customSend : script.send;
                this.logger.info('Executing script:', script.send)
                // this.outputToSession.next(Buffer.from(script.send + '\n'))
                this.outputToSession.next(Buffer.from(sendContent + '\n'));
                this.remainingScripts = this.remainingScripts.filter(x => x !== script)
            } else {
                break
            }
        }
    }

    unescape (line: string): string {
        line = line.replace(/\\((x\d{2})|(u\d{4}))/g, (match, g) => {
            return String.fromCharCode(parseInt(g.substr(1), 16))
        })
        return line.replace(/\\(.)/g, (match, g) => {
            return this.escapeSeqMap[g] || g
        })
    }
}
