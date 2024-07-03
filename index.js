import { readFileSync, existsSync, renameSync } from 'node:fs';
import { exec } from 'node:child_process';
import readline from 'node:readline';

// package.jsonファイルを読み込む
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

// devDependenciesのパッケージ名を取得
const devDependencies = Object.keys(packageJson.devDependencies);

// コマンドを作成
const command = `bun add --dev --cwd ../ ${devDependencies.join(' ')}`;

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

// .editorconfigファイルがルート直下にあるか確認
const editorConfigPath = './.editorconfig';
if (existsSync(editorConfigPath)) {
  rl.question('.editorconfigファイルを親階層に移動しますか？ (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      // .editorconfigファイルを親階層へ移動
      renameSync(editorConfigPath, '../.editorconfig');
      console.log('.editorconfigファイルを親階層に移動しました。');
    } else {
      console.log('.editorconfigファイルの移動をキャンセルしました。');
    }
    rl.close();
  });
} else {
  console.log('.editorconfigファイルがルート直下に存在しません。');
  rl.close();
}

// left-hookを導入するか確認
rl.question('left-hookを導入しますか？ (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    // left-hookを導入
    exec('bun add --dev left-hook', (error, stdout, stderr) => {
      if (error) {
        console.error(`エラー: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`標準エラー: ${stderr}`);
        return;
      }
      console.log(`標準出力: ${stdout}`);

      // left-hook.ymlファイルを親階層へ移動
      const leftHookConfigPath = './left-hook.yml';
      if (existsSync(leftHookConfigPath)) {
        renameSync(leftHookConfigPath, '../left-hook.yml');
        console.log('left-hook.ymlファイルを親階層に移動しました。');

        // lefthookをインストール
        exec('bunx lefthook install', (error, stdout, stderr) => {
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
        console.log('left-hook.ymlファイルがルート直下に存在しません。');
      }
    });
  } else {
    console.log('left-hookの導入をキャンセルしました。');
  }
  rl.close();
});

