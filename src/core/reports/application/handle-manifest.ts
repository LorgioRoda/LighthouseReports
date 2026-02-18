import { ManifestRepository } from "../domain/manifest-repository";
import { ManifestRun } from "../domain/manifest";

export class HandleManifest {
    constructor(
        private manifestRepository: ManifestRepository,
    ) {}

    public findAllRepresentativeRuns(): Array<{ run: ManifestRun; type: string }> {
        const manifests = this.manifestRepository.readAllManifests()

        const representativeRuns = manifests.flatMap((manifest) => {
          const representativeRun = manifest.runs.filter((run) => run.isRepresentativeRun);

          if (representativeRun.length === 0) {
            console.log(`⚠️  No representative run found in ${manifest.type} manifest`);
            return [];
          }

          console.log(
            `✅ Found representative run for ${manifest.type}: Performance ${Math.round(
              representativeRun[0].summary.performance * 100
            )}%`
          );
          return [{ run: representativeRun[0], type: manifest.type }];
        });

        if (representativeRuns.length === 0) {
          console.error("❌ No representative runs found in any manifest");
          throw new Error("❌ No representative runs found in any manifest");
        }

        return representativeRuns;
      }

}
