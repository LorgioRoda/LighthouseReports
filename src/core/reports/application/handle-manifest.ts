import { ManifestRepository } from "../domain/manifest-repository";
import { Logger } from "../domain/logger";
import { ManifestRun } from "../domain/manifest";

export class HandleManifest {
    constructor(
        private manifestRepository: ManifestRepository,
        private logger: Logger,
    ) {}

    public findAllRepresentativeRuns(): Array<{ run: ManifestRun; type: string }> {
        const manifests = this.manifestRepository.readAllManifests()

        const representativeRuns = manifests.flatMap((manifest) => {
          const representativeRun = manifest.runs.filter((run) => run.isRepresentativeRun);

          if (representativeRun.length === 0) {
            this.logger.info(`⚠️  No representative run found in ${manifest.type} manifest`);
            return [];
          }

          this.logger.info(
            `✅ Found representative run for ${manifest.type}: Performance ${Math.round(
              representativeRun[0].summary.performance * 100
            )}%`
          );
          return [{ run: representativeRun[0], type: manifest.type }];
        });

        if (representativeRuns.length === 0) {
          this.logger.error("❌ No representative runs found in any manifest");
          throw new Error("❌ No representative runs found in any manifest");
        }

        return representativeRuns;
      }

}
