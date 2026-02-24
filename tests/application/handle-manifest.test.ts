import { HandleManifest } from '../../src/core/reports/application/handle-manifest.js';
import { ManifestRepository } from '../../src/core/reports/domain/manifest-repository.js';
import { ManifestSource } from '../../src/core/reports/domain/manifest.js';


const fakeManifestSources: ManifestSource[] = [{
      type: 'mobile',
      path: './.lighthouse-reports/mobile/manifest.json',
      runs: [
        {
          url: ['http://example.com'],
          isRepresentativeRun: true,
          htmlPath: 'a.html',
          jsonPath: '../test',
          summary: { performance: 0.42, accessibility: 0, 'best-practices': 0, seo: 0, pwa: 0 }
        },
        {
          url: ['http://example1.com'],
          isRepresentativeRun: true,
          htmlPath: 'a.html',
          jsonPath: '../test',
          summary: { performance: 0.12, accessibility: 1, 'best-practices': 0, seo: 0, pwa: 0 }
        },
    ]
  },
  {
      type: 'desktop',
      path: './.lighthouse-reports/mobile/manifest.json',
      runs: [
        {
          url: ['http://example.com'],
          isRepresentativeRun: true,
          htmlPath: 'a.html',
          jsonPath: '../test',
          summary: { performance: 0.33, accessibility: 0, 'best-practices': 0, seo: 0, pwa: 0 }
        },
        {
          url: ['http://example1.com'],
          isRepresentativeRun: true,
          htmlPath: 'a.html',
          jsonPath: '../test',
          summary: { performance: 0.52, accessibility: 1, 'best-practices': 0, seo: 0, pwa: 0 }
        },
    ]
  },
  {
      type: 'desktop',
      path: './.lighthouse-reports/mobile/manifest.json',
      runs: [
        {
          url: ['http://example.com'],
          isRepresentativeRun: false,
          htmlPath: 'a.html',
          jsonPath: '../test',
          summary: { performance: 0.33, accessibility: 0, 'best-practices': 0, seo: 0, pwa: 0 }
        },
        {
          url: ['http://example1.com'],
          isRepresentativeRun: false,
          htmlPath: 'a.html',
          jsonPath: '../test',
          summary: { performance: 0.52, accessibility: 1, 'best-practices': 0, seo: 0, pwa: 0 }
        },
    ]
  }
];

const fakeManifestSourcesWithOutRepresentativeRun: ManifestSource[] = [{
      type: 'mobile',
      path: './.lighthouse-reports/mobile/manifest.json',
      runs: [
        {
          url: ['http://example.com'],
          isRepresentativeRun: false,
          htmlPath: 'a.html',
          jsonPath: '../test',
          summary: { performance: 0.42, accessibility: 0, 'best-practices': 0, seo: 0, pwa: 0 }
        },
    ]
  },
  {
      type: 'desktop',
      path: './.lighthouse-reports/mobile/manifest.json',
      runs: [
        {
          url: ['http://example.com'],
          isRepresentativeRun: false,
          htmlPath: 'a.html',
          jsonPath: '../test',
          summary: { performance: 0.33, accessibility: 0, 'best-practices': 0, seo: 0, pwa: 0 }
        },
    ]
  },
];


class FakeManifest implements ManifestRepository {
  constructor(private sources: ManifestSource[]) {
  }
  readAllManifests(): ManifestSource[] {
    return this.sources
  }
}

describe("readAllManifests", () => {

  it('should find multiples manifest', () => {
    const fakeManifest = new FakeManifest(fakeManifestSources)
    const manifest = new HandleManifest(fakeManifest).findAllRepresentativeRuns()
    expect(manifest.length).toBe(4)
  })
  it('should find summary values', () => {
    const fakeManifest = new FakeManifest(fakeManifestSources)
    const manifest = new HandleManifest(fakeManifest).findAllRepresentativeRuns()
    expect(manifest[0].run.summary).toMatchObject({ performance: 0.42, accessibility: 0, 'best-practices': 0, seo: 0, pwa: 0 })
  })
  it('should throw error when we dont have representatives',  () => {
    const fakeManifest = new FakeManifest(fakeManifestSourcesWithOutRepresentativeRun)

    expect(() => new HandleManifest(fakeManifest).findAllRepresentativeRuns()).toThrow("❌ No representative runs found in any manifest")
  })
});
