import { readFileSync } from 'fs';
import { exec } from 'child_process';
import readline from 'readline';

// package.jsonファイルを読み込む
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

// devDependenciesのパッケージ名を取得
const devDependencies = Object.keys(packageJson.devDependencies);

// コマンドを作成
const command = `bun add --dev  ${devDependencies.join(' ')}`;

// ユーザーに確認を求める
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`次のコマンドを実行しますか？ (yes/no): ${command}\n`, (answer) => {
  if (answer.toLowerCase() === 'yes') {
    // コマンドを実行
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`エラー: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`標準エラー: ${stderr}`);
        return;
      }
      console.log(`標準出力: ${stdout}`);
    });
  } else {
    console.log('コマンドの実行をキャンセルしました。');
  }
  rl.close();
});