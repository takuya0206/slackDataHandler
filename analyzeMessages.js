const helpers = require('./helpers')
let targetUser = null


if (process.argv.length > 2) {
  targetUser = process.argv[2]
} else {
  throw ('引数にSlackのuserIdを設定してください');;
}

helpers.getData().then( async (res) => {
  const data = {
    messageCount: 0,
    talkTo : {},
    beCalled: {},
  }
  await Promise.all(res.map( async (message) => {

    // subtypeがあれば人の送ったメッセージではない
    if (message.subtype) {
      return false
    }

    if(message.user === targetUser) {
      data.messageCount += 1
      const talkTos = await message.text.match(/<@\w*>/g)
      if (talkTos) {
        talkTos.map((person) => {
          person = person.replace(/<@/, '').replace('>', '')
          helpers.getUserName(person).then((userName) => {
            if (data.talkTo[userName] !== undefined) {
              data.talkTo[userName] = data.talkTo[userName] + 1
            } else {
              data.talkTo[userName] = 1
            }
          })
        })
      }
    } else {
      const resExp = new RegExp('<@'+targetUser+'>', 'g')
      const beCalleds = await message.text.match(resExp)
      if (beCalleds) {
        helpers.getUserName(message.user).then((userName) => {
          if (data.beCalled[userName] !== undefined) {
            data.beCalled[userName] = data.beCalled[userName] + 1
          } else {
            data.beCalled[userName] = 1
          }
        })
      }
    }
  }))
  //多い順に並び替えて出力
  const talkToObj = Object.entries(data.talkTo)
  talkToObj.sort((p1, p2) => {
    const p1Val = p1[1]
    const p2Val = p2[1]
    return p2Val - p1Val
  })
  const beCalledObj = Object.entries(data.beCalled)
  beCalledObj.sort((p1, p2) => {
    const p1Val = p1[1]
    const p2Val = p2[1]
    return p2Val - p1Val
  })
  helpers.getUserName(targetUser).then((userName) => {
    console.log(`${userName}さんのSlackの分析結果です`)
    console.log('投稿した回数', data.messageCount)
    console.log('話しかけた相手', Object.fromEntries(talkToObj))
    console.log('話しかけられた相手', Object.fromEntries(beCalledObj))
  })
})
