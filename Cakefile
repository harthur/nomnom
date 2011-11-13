{spawn} = require "child_process"


task 'build', 'build nomnom from source', (callback) ->
  spawn 'coffee', ['-c', '-o', 'lib', 'src']

task 'test', 'run test suite', (callback) ->
  proc = spawn 'nodeunit', ['test']
  proc.stdout.on 'data', (buffer) ->
    process.stdout.write buffer.toString()
