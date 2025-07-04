import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 [--file <path>] [--gist <id>]")
    .option("file", {
      alias: "f",
      type: "string",
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

  let reportPath: string;
  let filename: string;

  if (argv.file) {
    reportPath = argv.file;
    filename = argv.file.split("/").pop() || argv.file;
  } else {
    // Read from manifest.json to get the representative run
    try {
      const manifestContent = fs.readFileSync("manifest.json", "utf-8");
      const manifest = JSON.parse(manifestContent);
      const representativeRun = manifest.find((run: any) => run.isRepresentativeRun);
      
      if (!representativeRun) {
        console.error("❌ No se encontró el run representativo en manifest.json");
        process.exit(1);
      }
      
      reportPath = representativeRun.jsonPath;
      filename = reportPath.split("/").pop() || "lighthouse-report.json";
      console.log(`📊 Usando el run representativo: ${filename}`);
    } catch (err) {
      console.error("❌ No pude leer manifest.json:", err);
      process.exit(1);
    }
  }

  let content: string;
  try {
    content = fs.readFileSync(reportPath, "utf-8");
  } catch (err) {
    console.error(`❌ No pude leer el archivo ${reportPath}:`, err);
    process.exit(1);
  }

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