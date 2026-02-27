import { ManifestSource } from "./manifest.ts";

export interface ManifestRepository {
    readAllManifests(): ManifestSource[]
}