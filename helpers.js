const fs = require('fs');
const path = require('path');

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

// チャンネルフォルダごとのjsonファイルを全て統合してarrayにしObjectで返す
const getData = () => {
  return new Promise( async (resolve) => {
    let result = {}
    const dirs = fs.readdirSync('./data')
    await Promise.all(dirs.map( async (dir) => {
      const dirPath = path.join('./data', dir)
      if(/\./.test(dirPath) !== true){ // slackのチャンネル名は記号が-しか使えないため、.があればディレクトリではないとする
        result[dir] = []
        const files = fs.readdirSync(dirPath)
        await Promise.all(files.map( async (file) => {
          if(/\.json/.test(file)) {
            const filePath = path.join('./data', dir, file)
            result[dir] = result[dir].concat(JSON.parse(fs.readFileSync(filePath, 'utf8')))
          }
        }))
      }
    }))
    resolve(result)
  })
}

const sortObjectByValue = (unsortedObject) => {
  const result = Object.entries(unsortedObject)
  result.sort((p1, p2) => {
    const p1Val = p1[1]
    const p2Val = p2[1]
    return p2Val - p1Val
  })
  return Object.fromEntries(result)
}


module.exports = {
  getUserName,
  getData,
  sortObjectByValue
}
