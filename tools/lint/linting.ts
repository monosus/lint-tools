import { exec } from "child_process";
import { promisify } from "util";
import { glob } from "glob";

const globAsync = promisify(glob);

async function runCommand(command: string, commandName: string): Promise<void> {
	console.log(`実行中のコマンド: ${commandName}`);
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`エラー (${commandName}): ${error.message}`);
				reject(error);
				return;
			}
			if (stderr) {
				console.error(`標準エラー (${commandName}): ${stderr}`);
				reject(new Error(stderr));
				resolve();
				return;
			}
			console.log(`標準出力 (${commandName}): ${stdout}`);
			resolve();
		});
	});
}

async function main() {
	const cssFiles = await globAsync("../**/*.css");

	const commands = [
		runCommand(
			"bunx ls-lint -config ./tools/lint/.ls-lint.yml",
			"ls-lint",
		),
		runCommand(
			"bunx biome check --config-path ./tools/lint/ --write .",
			"biome",
		),
	];

	if (cssFiles.length > 0) {
		commands.push(
			runCommand(
				"bunx stylelint '../**/*.css' '**/*.css' --config tools/lint/.stylelintrc.json --fix",
				"stylelint-fix",
			),
			runCommand(
				"bunx stylelint '../**/*.css' '**/*.css' --config tools/lint/.stylelintrc.json",
				"stylelint",
			)
		);
	}

	commands.push(
		runCommand("bunx tsc --noEmit -p tsconfig.json", "tsc"),
		runCommand(
			"bunx markuplint --config tools/lint/.markuplintrc.yml src/**/*.{tsx,html}",
			"markuplint",
		),
		// runCommand(
		// 	"bunx markdownlint-cli2 --config \"./tools/lint/.markdownlint-cli2.jsonc\" \"./**/*.{md,mdx}\" --fix",
		// 	"markdownlint",
		// ),
	);

	const results = await Promise.allSettled(commands);

	const errors = results.filter((result) => result.status === "rejected");

	if (errors.length > 0) {
		console.error("エラーが発生しました:");
		for (const [index, error] of errors.entries()) {
			if ("reason" in error && error.reason instanceof Error) {
				console.error(`エラー ${index + 1}: ${error.reason.message}`);
			}
		}
		process.exit(1); // エラーがある場合、非ゼロの終了コードを返します
	} else {
		console.log("ok 👍");
	}
}

main();