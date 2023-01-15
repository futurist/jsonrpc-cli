
export class JSONRPCResponse {
    constructor(onResponse) {
      this.onResponse = onResponse
      this.store = {
        length: 0,
        buffers: [],
      }
    }
    checkResult() {
      const { length, buffers } = this.store
      const total = buffers.reduce((p, buf) => {
        return p += buf.length
      }, 0)
      if (total >= length && length) {
        const all = Buffer.concat(buffers)
        const str = all.subarray(0, length).toString('utf8')
        try {
          const result = JSON.parse(str)
          this.onResponse(null, result)
        } catch (e) {
          this.onResponse(e, str)
        }
        // remained buffer
        this.parseBuffer(all.subarray(length))
      }
    }
    parseBuffer(buf, isNew) {
      const header = buf.indexOf('Content-Length:')
      if (header >= 0) {
        const len = parseInt(buf.toString('utf8', header + 15, header + 50))
        if (!len) {
          this.onResponse(new Error('error: bad content-length header'))
          this.store.length = 0
          this.store.buffers = []
        } else {
          const i = buf.indexOf('\r\n\r\n', header)
          if (i > 0) {
            buf = buf.subarray(i + 4)
          }
          // start of data
          this.store.length = len
          this.store.buffers = [buf]
          this.checkResult()
        }
      } else if (isNew) {
        this.store.buffers.push(buf)
        this.checkResult()
      }
    }
  }