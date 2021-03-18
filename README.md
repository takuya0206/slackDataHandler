Slackのworkspace内に投稿されているメッセージを分析するツールです。Slackのフリープランとスタンダードプランでは、データのエクスポートの形式が便利な状態とは言えないため、スクリプトを用意することにしました。

## 分析内容
### 特定のメンバーのコミュニケーションライン
 - パブリックチャンネルにて
   - 投稿した総数
   - メンションをつけた相手とその回数
   - メンションをつけられた相手とその回数

※他の機能は現時点では存在しません。必要に応じて追加します（しないかもしれない）。

## 事前準備
Slackのワークスペースよりデータをエクスポートし、`data`ディレクトリの配下に移動させる（エクスポートの方法は[ワークスペースのデータをエクスポートする](https://slack.com/intl/ja-jp/help/articles/201658943-%E3%83%AF%E3%83%BC%E3%82%AF%E3%82%B9%E3%83%9A%E3%83%BC%E3%82%B9%E3%81%AE%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88%E3%81%99%E3%82%8B)を参照）。注意点としてはエクスポートしたデータのルート以下のデータを移動すること。

```
{ワークスペース名} Slack export {開始日程} - {終了日程}
└{チャンネル名}1
└{チャンネル名}2
└{チャンネル名}3
└{チャンネル名}4
...
channels.json
integration_logs.json
users.json
```

エクスポートは上記の形式を想定しており、{ワークスペース名} Slack export {開始日程} - {終了日程} は含めず、その配下のデータを移す。


## 実行方法
以下を実行。`{userId}`は分析したい相手のIDに入れ替えてください。

- 特定のメンバーのコミュニケーションライン
  - `node analyzeMessages.js {userId}`