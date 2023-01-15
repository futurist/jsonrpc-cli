import repl from 'node:repl'
import net from 'node:net'
import { inspect } from 'node:util'
import {JSONRPCResponse} from './jsonrpc.js'

/** @type {net.Socket} */
let socket
let inputStr = ''
const helpMessage = `
\h               help
\b               print current buffer
\c [host:port]   connect to host:port
empty(enter)     clear buffer
`

export const jsonrpcREPL = repl.start({ prompt: '> ', eval: evalJSONRPC })
const response = new JSONRPCResponse((err, result)=>{
  console.log(err, inspect(result, false, null, true))
  jsonrpcREPL.output.write('\n> ')
})

function connect(host, port) {
  if (!host) {
    host = '0.0.0.0'
  }
  socket = net.createConnection({ host, port }, () => {
    console.log('connected:', host, port)
  })
  socket.on('close', () => socket = null)
  socket.on('error', e => {
    socket.destroy()
    console.log(e)
  })
  socket.on('data', buf => response.parseBuffer(buf, true))
}

/**
 * 
 * @param {string} cmd 
 */
function evalJSONRPC(cmd, context, filename, callback) {
  if (cmd == '\n') {
    if (inputStr) {
      jsonrpcREPL.write('buffer cleared\n')
    }
    inputStr = ''
    return callback()
  } else if (cmd.startsWith('\\h')) {
    return callback(null, helpMessage)
  } else if (cmd.startsWith('\\b')) {
    return callback(null, inputStr)
  } else if (cmd.startsWith('\\c')) {
    const [host, port] = cmd.slice(2).trim().split(/[:\s]/)
    connect(host, port)
    return callback()
  }
  inputStr += cmd
  const json = parseJSON(inputStr)
  if (!json) {
    callback()
    return
  }
  if (socket && !socket.closed) {
    const len = inputStr.length
    socket.write(`Content-Length: ${len}\r\n\r\n${inputStr}`)
    inputStr = ''
    callback(null, json)
  } else {
    inputStr = ''
    callback(null, 'error: socket not connected, use "\\c host:port" to connect to JSONRPC server')
  }
}

function parseJSON(str) {
  try {
    return JSON.parse(str)
  } catch (e) { }
}

