import { LighthouseGistUploader } from '../../src/upload-gist';
import fs from 'fs';
import { Octokit } from '@octokit/rest';

jest.mock('fs');
jest.mock('@octokit/rest');


describe("readAllManifests", () => {
    const fakeRuns = [{
        url: 'http://example.com',
        isRepresentativeRun: true,
        htmlPath: 'a.html',
        jsonPath: 'a.json',
        summary: { performance: 0.42, accessibility:0, "best-practices":0, seo:0, pwa:0 }
      }];
    beforeEach(() => {
        (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify(fakeRuns));
    });
    
    it("should read all manifests", () => {
      const uploader = new LighthouseGistUploader('token');
      console.log(uploader);
      
    // expect(manifests).toBeDefined();
  });
});