const msgPath = process.env.GIT_PARAMS
console.log(msgPath, process.env)
const msg = require('fs').readFileSync(msgPath, 'utf-8').trim()

const releaseRE = /^v\d/
const commitRE =
  /^(revert: )?(feat|fix|docs|dx|refactor|perf|test|workflow|build|ci|chore|types|wip|release|deps)(\(.+\))?: .{1,50}/

if (!releaseRE.test(msg) && !commitRE.test(msg)) {
  console.log()
  console.error(
    `格式错误，请查看./scripts/verifyCommit.js代码中的正则`
  )
  process.exit(1)
} 
