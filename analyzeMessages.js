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
    talkAt: {},
    talkTo : {},
    beCalled: {},
  }

  await Promise.all(Object.keys(res).map( async (channel) => {

    await Promise.all(res[channel].map( async (message) => {

      // subtypeがあれば人の送ったメッセージではない
      if (message.subtype) {
        return false
      }

      if(message.user === targetUser) {

        //投稿の総数
        data.messageCount += 1

        //投稿した場所をカウント
        if (data.talkAt[channel] !== undefined) {
          data.talkAt[channel] = data.talkAt[channel] + 1
        } else {
          data.talkAt[channel] = 1
        }

        // 話しかけた相手をカウント
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
        // 話しかけられた相手をカウント
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
  }))

  // 出力
  helpers.getUserName(targetUser).then((userName) => {
    console.log(`${userName}さんのSlackの分析結果です`)
    console.log('投稿した回数', data.messageCount)
    console.log('投稿した場所', helpers.sortObjectByValue(data.talkAt))
    console.log('話しかけた相手', helpers.sortObjectByValue(data.talkTo))
    console.log('話しかけられた相手', helpers.sortObjectByValue(data.beCalled))
  })
})
