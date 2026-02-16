import { ManifestSource } from "./manifest";

export interface ManifestRepository {
    readAllManifests(): ManifestSource[]
}