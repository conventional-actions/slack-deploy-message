import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_VERSION'] = 'v1.2.3'
  process.env['INPUT_WEBHOOK-URL'] = ''
  process.env['GITHUB_REPOSITORY'] = 'ketch-com/bearing'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  try {
    cp.execFileSync(np, [ip], options)
  } catch (err) {
    console.log((err as any).stdout.toString())
  }
})
