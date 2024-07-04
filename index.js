import { readFileSync, existsSync, renameSync, writeFileSync } from "node:fs";
import { exec } from "node:child_process";
import readline from "node:readline";

// package.jsonファイルを読み込む
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

// devDependenciesのパッケージ名を取得
const devDependencies = Object.keys(packageJson.devDependencies);

// コマンドを作成
const command = `bun add --dev --cwd ../ ${devDependencies.join(" ")}`;

// ユーザーに確認を求める
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  const answer = await askQuestion(
    '依存関係をインストールしましょう！ (yes/no)\n'
  );
  if (answer.toLowerCase() === "yes" || answer.trim() === "") {
    try {
      await execCommand(command);
      await handleEditorConfig();
      await handleLeftHook();
      await addLintScript();
    } catch (error) {
      console.error(`エラー: ${error.message}`);
      await handleEditorConfig();
      await handleLeftHook();
      await addLintScript();
    } finally {
      rl.close();
    }
  } else {
    console.log("コマンドの実行をキャンセルしました。");
    rl.close();
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`標準エラー: ${stderr}`);
      }
      console.log(`標準出力: ${stdout}`);
      resolve();
    });
  });
}

async function handleEditorConfig() {
  const editorConfigPath = "./.editorconfig";
  if (existsSync(editorConfigPath)) {
    const answer = await askQuestion(
      ".editorconfigファイルを親階層に移動しますか？ (yes/no): "
    );
    if (answer.toLowerCase() === "yes" || answer.trim() === "") {
      renameSync(editorConfigPath, "../.editorconfig");
      console.log(".editorconfigファイルを親階層に移動しました。");
    } else {
      console.log(".editorconfigファイルの移動をキャンセルしました。");
    }
  } else {
    console.log(".editorconfigファイルがルート直下に存在しません。");
  }
}

async function handleLeftHook() {
  const answer = await askQuestion("left-hookを導入しますか？ (yes/no): ");
  if (answer.toLowerCase() === "yes" || answer.trim() === "") {
    try {
      const leftHookConfigPath = "./lefthook.yml";
      if (existsSync(leftHookConfigPath)) {
        await renameSync(leftHookConfigPath, "../lefthook.yml");
        console.log("lefthook.ymlファイルを親階層に移動しました。");
        await execCommand("bun add --dev --cwd ../ lefthook");
        await execCommand("cd .. && bunx lefthook install");
      } else {
        console.log("lefthook.ymlファイルがルート直下に存在しません。");
      }
    } catch (error) {
      console.error(`エラー: ${error.message}`);
    }
  } else {
    console.log("lefthookの導入をキャンセルしました。");
  }
}

async function addLintScript() {
  const parentPackageJsonPath = "../package.json";
  if (existsSync(parentPackageJsonPath)) {
    const parentPackageJson = JSON.parse(
      readFileSync(parentPackageJsonPath, "utf8")
    );
    parentPackageJson.scripts = parentPackageJson.scripts || {};
    parentPackageJson.scripts.lint = "bun ./lint-tools/linting.ts";
    writeFileSync(
      parentPackageJsonPath,
      JSON.stringify(parentPackageJson, null, 2),
      "utf8"
    );
    console.log("親階層のpackage.jsonにlintスクリプトを追加しました。");
  } else {
    console.log("親階層にpackage.jsonが存在しません。");
  }
}

main();
