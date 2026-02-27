import { FileReader } from "../domain/file-reader.ts";
import * as fs from "fs";


export class FileReaderSystem implements FileReader {
    constructor() {}
    read(reportPath: string): string {
        try {
          return fs.readFileSync(reportPath, "utf-8");
        } catch (err) {
          console.error(`❌ Unable to read report file ${reportPath}:`, err);
          throw err;
        }
    }
}