import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 --file <path> [--gist <id>]")
    .option("file", {
      alias: "f",
      type: "string",
      demandOption: true,
      describe: "Ruta al JSON de Lighthouse",
    })
    .option("gist", {
      alias: "g",
      type: "string",
      describe: "ID del Gist a actualizar (omit para crear uno nuevo)",
    })
    .help()
    .parseSync();

  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("❌ Necesitas definir GH_TOKEN o usar GITHUB_TOKEN de Actions.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  let content: string;
  try {
    content = fs.readFileSync(argv.file, "utf-8");
  } catch (err) {
    console.error(`❌ No pude leer el archivo ${argv.file}:`, err);
    process.exit(1);
  }
  const filename = argv.file.split("/").pop() || argv.file;

  try {
    if (argv.gist) {
      await octokit.gists.update({
        gist_id: argv.gist,
        files: { [filename]: { content } },
      });
      console.log(`✅ Gist ${argv.gist} actualizado.`);
    } else {
      const res = await octokit.gists.create({
        files: { [filename]: { content } },
        public: false,
        description: "Informe Lighthouse CI generado automáticamente",
      });
      console.log(`✅ Gist creado: ${res.data.id}`);
      console.log(`🔗 Visor: https://googlechrome.github.io/lighthouse/viewer/?gist=${res.data.id}`);
    }
  } catch (err) {
    console.error("❌ Error con la API de GitHub:", err);
    process.exit(1);
  }
}

main();