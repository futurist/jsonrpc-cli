import assert from 'node:assert'
import { test } from 'node:test'
import { JSONRPCResponse } from './jsonrpc.js'

test('long response', () => {
    const responseStr = 'Content-Length: 214\r\n\r\n{"seq":0,"type":"response","request_seq":3,"success":true,"command":"setBreakpoints","body":{"breakpoints":[{"id":1,"verified":true,"source":{"name":"main.go","path":"/Users/jm/project/gotest/main.go"},"line":8}]}}\nContent-Length: 132\r\n\r\n{"seq":0,"type":"event","event":"output","body":{"category":"console","output":"Type \'dlv help\' for list of commands.","source":{}}}Content-Length: 88\r\n\r\n{"seq":0,"type":"response","request_seq":6,"success":true,"command":"configurationDone"}'
    const error = [null, null, null]
    const result = [
        {
            seq: 0,
            type: 'response',
            request_seq: 3,
            success: true,
            command: 'setBreakpoints',
            body: {
                breakpoints: [
                    {
                        id: 1,
                        verified: true,
                        source: {
                            name: 'main.go',
                            path: '/Users/jm/project/gotest/main.go'
                        },
                        line: 8
                    }
                ]
            }
        },
        {
            seq: 0,
            type: 'event',
            event: 'output',
            body: {
                category: 'console',
                output: "Type 'dlv help' for list of commands.",
                source: {}
            }
        },
        {
            seq: 0,
            type: 'response',
            request_seq: 6,
            success: true,
            command: 'configurationDone'
        }
    ]
    const d = new JSONRPCResponse((e, r) => {
        console.log(r)
        assert.deepEqual(e, error.shift())
        assert.deepEqual(r, result.shift())
    })
    d.parseBuffer(Buffer.from(responseStr), true)
})

test('single response', () => {
    const responseStr = 'Content-Length: 433\r\n\r\n{"command":"initialize","arguments":{"clientID":"vscode","clientName":"Visual Studio Code","adapterID":"go","locale":"zh-cn","linesStartAt1":true,"columnsStartAt1":true,"pathFormat":"path","supportsVariableType":true,"supportsVariablePaging":true,"supportsRunInTerminalRequest":true,"supportsMemoryReferences":true,"supportsProgressReporting":true,"supportsInvalidatedEvent":true,"supportsMemoryEvent":true},"seq":1,"type":"request"}'
    const error = [null]
    const result = [
        {"command":"initialize","arguments":{"clientID":"vscode","clientName":"Visual Studio Code","adapterID":"go","locale":"zh-cn","linesStartAt1":true,"columnsStartAt1":true,"pathFormat":"path","supportsVariableType":true,"supportsVariablePaging":true,"supportsRunInTerminalRequest":true,"supportsMemoryReferences":true,"supportsProgressReporting":true,"supportsInvalidatedEvent":true,"supportsMemoryEvent":true},"seq":1,"type":"request"}
    ]
    const d = new JSONRPCResponse((e, r) => {
        console.log(r)
        assert.deepEqual(e, error.shift())
        assert.deepEqual(r, result.shift())
    })
    d.parseBuffer(Buffer.from(responseStr), true)
})
