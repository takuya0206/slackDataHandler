const fs = require('fs');
const path = require('path');


let targetUser = null


if (process.argv.length > 2) {
  targetUser = process.argv[2]
} else {
  throw ('引数にSlackのuserIdを設定してください');;
}



const getUserName = (userId) => {
  return new Promise((resolve) => {
    let data = null
    try {
      data = require('./data/users.json')
    } catch {
      console.log('users.jsonがdataフォルダの直下にありません');
    }
    data.forEach((user) => {
      if(user.id === userId){
        resolve(user.profile.real_name)
      }
    })
  })
}


const getDirectories = () => {
  return new Promise( async (resolve) => {
    const dirs = fs.readdirSync('./data')
    const result = []
    await Promise.all(dirs.map( async (dir) => {

    }))
  })
}


const getData = () => {
  return new Promise( async (resolve) => {
    let result = []
    const dirs = fs.readdirSync('./data')
    await Promise.all(dirs.map( async (dir) => {
      const dirPath = path.join('./data', dir)
      if(/\./.test(dirPath) !== true){
        const files = fs.readdirSync(dirPath)
        await Promise.all(files.map( async (file) => {
          if(/\.json/.test(file)) {
            const filePath = path.join('./data', dir, file)
            result = result.concat(JSON.parse(fs.readFileSync(filePath, 'utf8')))
          }
        }))
      }
    }))
    resolve(result)
  })
}


getData().then( async (res) => {
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
          getUserName(person).then((userName) => {
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
        getUserName(message.user).then((userName) => {
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
  getUserName(targetUser).then((userName) => {
    console.log(`${userName}さんのSlackの分析結果です`)
    console.log('投稿した回数', data.messageCount)
    console.log('話しかけた相手', Object.fromEntries(talkToObj))
    console.log('話しかけられた相手', Object.fromEntries(beCalledObj))
  })
})
