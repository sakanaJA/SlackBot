// Slackの設定
const SLACK_VERIFICATION_TOKEN = 'YOUR_SLACK_VERIFICATION_TOKEN';
const SLACK_ACCESS_TOKEN = 'xoxb-YOUR_SLACK_BOT_USER_OAUTH_ACCESS_TOKEN';

// スプレッドシートの設定
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'Sheet1'; // スプレッドシートのシート名

/**
 * Webアプリのエンドポイントとして機能します。
 */
function doPost(e) {
  const params = JSON.parse(e.postData.getDataAsString());
  const token = params.token;

  // Slackの認証トークンを検証
  if (token !== SLACK_VERIFICATION_TOKEN) {
    return ContentService.createTextOutput('Invalid token');
  }

  // イベントがテキストメッセージであることを確認
  const eventType = params.event.type;
  if (eventType === 'app_mention' || eventType === 'message') {
    const text = params.event.text;
    const channelId = params.event.channel;

    // 特定のキーワードを検出
    if (text.includes('キーワード')) {
      const responseText = getSpreadsheetData();
      postMessageToSlack(channelId, responseText);
    }
  }

  return ContentService.createTextOutput();
}

/**
 * Googleスプレッドシートからデータを取得します。
 */
function getSpreadsheetData() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const range = sheet.getDataRange();
  const values = range.getValues();

  // ここでスプレッドシートのデータを処理
  // 例: 最初の行のG列の値を返す
  const data = values[0][6]; // G列は7番目のインデックスです

  return data;
}

/**
 * Slackにメッセージを投稿します。
 */
function postMessageToSlack(channelId, message) {
  const url = 'https://slack.com/api/chat.postMessage';
  const payload = {
    channel: channelId,
    text: message,
    as_user: false
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + SLACK_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
}
