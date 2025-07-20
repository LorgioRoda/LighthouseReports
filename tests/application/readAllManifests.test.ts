process.env.GH_TOKEN = 'dummy_token_for_dry_run';
import { LighthouseGistUploader } from '../../src/upload-gist.js';
import fs from 'fs';

jest.mock('fs');
jest.mock('@octokit/rest', () => {
  const mockOctokit = { gists: { create: jest.fn() } };
  return { Octokit: jest.fn(() => mockOctokit) };
});

const fakeRuns = [{
  url: 'http://example1.com',
  isRepresentativeRun: true,
  htmlPath: 'a.html',
  jsonPath: 'a.json',
  type: 'desktop',
  path: './.lighthouse-reports/desktop/manifest.json',
  summary: { performance: 0.42, accessibility: 0, 'best-practices': 0, seo: 0, pwa: 0 },
}, {
  url: 'http://example.com',
  isRepresentativeRun: true,
  htmlPath: 'a.html',
  jsonPath: 'a.json',
  type: 'mobile',
  path: './.lighthouse-reports/mobile/manifest.json',
  summary: { performance: 0.42, accessibility: 0, 'best-practices': 0, seo: 0, pwa: 0 }
}];

describe("readAllManifests", () => {
  beforeEach(() => { 
    (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify(fakeRuns))
    
  });

  afterEach(() => {
    delete process.env.GH_TOKEN;
    jest.clearAllMocks();
  });
    
  it("should read all manifests, mobile, desktop, and main", () => {
    const uploader = new LighthouseGistUploader('token');
    const source = (uploader as any).readAllManifests();
    expect(fs.readFileSync).toHaveBeenCalledWith(
        './.lighthouse-reports/manifest.json', 'utf-8'
      );
      expect(fs.readFileSync).toHaveBeenCalledTimes(3);
      expect(source).toBeDefined();
      expect(source.length).toBe(3);
  });

  it("should find main source", () => {
    const uploader = new LighthouseGistUploader('token');
    const source = (uploader as any).readAllManifests();
    expect(fs.readFileSync).toHaveBeenCalledWith(
      './.lighthouse-reports/manifest.json', 'utf-8'
    );
    expect(source[0].type).toBe('main');
  });

  it("should find mobile source in main manifest", () => {
    const uploader = new LighthouseGistUploader('token');
    const source = (uploader as any).readAllManifests();
    expect(fs.readFileSync).toHaveBeenCalledWith(
      './.lighthouse-reports/manifest.json', 'utf-8'
    );
    expect(source[0].runs[1].type).toBe('mobile');
    expect(source[0].runs[1].path).toBe('./.lighthouse-reports/mobile/manifest.json');
  });

  it("should find desktop source in main manifest", () => {
    const uploader = new LighthouseGistUploader('token');
    const source = (uploader as any).readAllManifests();
    expect(fs.readFileSync).toHaveBeenCalledWith(
      './.lighthouse-reports/manifest.json', 'utf-8'
    );
    expect(source[0].runs[0].type).toBe('desktop');
    expect(source[0].runs[0].path).toBe('./.lighthouse-reports/desktop/manifest.json');
  });
});