# 🚀 Lighthouse CI Gist Reporter

A comprehensive Lighthouse CI automation tool that performs website performance audits and automatically uploads reports to GitHub Gists for easy sharing and viewing.

## 📋 What This Project Does

This repository automates web performance testing using Google Lighthouse CI and provides a seamless way to:

- 🔍 **Run Lighthouse audits** on multiple URLs with different device configurations
- 📱 **Test both mobile and desktop** performance separately
- 📊 **Generate detailed performance reports** with metrics like Performance, Accessibility, Best Practices, SEO, and PWA scores  
- 🔗 **Upload reports to GitHub Gists** for easy sharing and online viewing
- 📈 **View reports** directly in [Lighthouse's online viewer](https://googlechrome.github.io/lighthouse/viewer/)
- 🧪 **Support dry-run mode** for testing without actual uploads

Currently configured to test **Cupra Official websites** (Danish and Finnish markets), but easily configurable for any website.

## 🏗️ Architecture

The project follows clean architecture principles with:

```
src/
├── upload-gist.ts          # Main application logic and CLI entry point
├── domain/                 # Business logic and entities  
├── application/            # Use cases and application services
└── infrastructure/         # External services and data access

tests/
├── application/            # Application layer tests
├── domain/                 # Domain layer tests  
└── infrastructure/         # Infrastructure layer tests
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm** package manager
- **GitHub Personal Access Token** with gist creation permissions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lighthouseReports
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up GitHub token**
   ```bash
   # For local development
   export GH_TOKEN="your_github_personal_access_token"
   
   # Or create a .env file (don't commit this!)
   echo "GH_TOKEN=your_github_personal_access_token" > .env
   ```

## 🎯 Usage

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm test` | Run all Jest tests |
| `pnpm run lhci` | Run Lighthouse CI with main config |  
| `pnpm run lhci:mobile` | Run mobile-specific Lighthouse audits |
| `pnpm run lhci:desktop` | Run desktop-specific Lighthouse audits |
| `pnpm run lhci:all` | Run both mobile and desktop audits |
| `pnpm run upload-gist` | Upload generated reports to GitHub Gists |

### Basic Workflow

1. **Run performance audits:**
   ```bash
   # Test both mobile and desktop
   pnpm run lhci:all
   
   # Or run individually  
   pnpm run lhci:mobile
   pnpm run lhci:desktop
   ```

2. **Upload results to GitHub:**
   ```bash
   # Upload all generated reports
   pnpm run upload-gist
   
   # Or with dry-run to test first
   node --loader ts-node/esm src/upload-gist.ts --dry-run
   ```

3. **View your reports:**
   - Reports are uploaded as GitHub Gists
   - Each gist can be viewed in [Lighthouse Viewer](https://googlechrome.github.io/lighthouse/viewer/)
   - URLs are automatically generated and displayed

## ⚙️ Configuration

### Website URLs

Edit the URLs in `.lighthouserc.mobile.cjs` and `.lighthouserc.desktop.cjs`:

```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'https://your-website.com',
        'https://your-website.com/another-page',
      ],
      // ... other settings
    }
  }
};
```

### Lighthouse Settings

The configurations include:

**Mobile Configuration:**
- Form factor: Mobile device simulation
- Standard mobile throttling
- 3 runs per URL for accuracy

**Desktop Configuration:**  
- Form factor: Desktop (1024x850 resolution)
- Faster network throttling (10Mbps)
- No CPU throttling for desktop performance
- 3 runs per URL for accuracy

### Advanced CLI Options

```bash
# Upload with custom gist ID
node --loader ts-node/esm src/upload-gist.ts --gist=your-gist-id

# Dry run mode (test without uploading)
node --loader ts-node/esm src/upload-gist.ts --dry-run

# Upload specific file
node --loader ts-node/esm src/upload-gist.ts --file=path/to/report.json
```

## 📊 Example Output

When you run the uploader, you'll see output like:

```
🚀 Lighthouse Gist Uploader - Multiple Reports Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Main manifest loaded
📱 Mobile manifest loaded  
🖥️  Desktop manifest loaded

✅ Found representative run for mobile: Performance 87%
✅ Found representative run for desktop: Performance 94%

🚀 Uploading 2 representative runs...

📤 Processing mobile report...
✅ MOBILE gist created: abc123def456
🔗 Viewer: https://googlechrome.github.io/lighthouse/viewer/?gist=abc123def456

📤 Processing desktop report...
✅ DESKTOP gist created: def456ghi789  
🔗 Viewer: https://googlechrome.github.io/lighthouse/viewer/?gist=def456ghi789

📊 SUMMARY - 2 Gists Created:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MOBILE
   📈 Performance: 87%
   🆔 Gist ID: abc123def456
   🔗 Viewer: https://googlechrome.github.io/lighthouse/viewer/?gist=abc123def456

2. DESKTOP
   📈 Performance: 94%
   🆔 Gist ID: def456ghi789
   🔗 Viewer: https://googlechrome.github.io/lighthouse/viewer/?gist=def456ghi789

📊 Average Performance: 91%
```

## 🧪 Testing

The project includes comprehensive Jest tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode  
pnpm test -- --watch

# Run specific test file
pnpm test -- readAllManifests.test.ts
```

## 🔧 Development

### TypeScript Configuration

- **ES2020 modules** with TypeScript
- **Strict mode** enabled for better code quality
- **Import extensions** required for proper ES module resolution

### Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment
- **Lighthouse CI** - Performance testing
- **Octokit** - GitHub API integration
- **Jest** - Testing framework
- **Yargs** - CLI argument parsing
- **pnpm** - Fast, disk space efficient package manager

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run tests (`pnpm test`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 Common Use Cases

### CI/CD Integration

Perfect for automated performance monitoring in your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Lighthouse CI
  run: |
    pnpm run lhci:all
    pnpm run upload-gist
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Performance Monitoring

- Track performance changes over time
- Compare mobile vs desktop performance  
- Share results with team members via Gist URLs
- Monitor core web vitals and accessibility scores

### Quality Gates

Use the performance scores to implement quality gates in your deployment process.

## 🆘 Troubleshooting

### Common Issues

**"Cannot find module" errors:**
- Ensure you're using Node.js 18+
- Run `pnpm install` to reinstall dependencies

**GitHub API errors:**
- Verify your `GH_TOKEN` is set correctly
- Ensure the token has `gist` permissions
- Check your GitHub API rate limits

**Lighthouse CI failures:**  
- Verify the target URLs are accessible
- Check network connectivity
- Review Lighthouse CI logs in `.lighthouse-ci/` directory

### Debug Mode

Run with dry-run first to test configuration:
```bash
node --loader ts-node/esm src/upload-gist.ts --dry-run
```

## 📄 License

This project is available for use under your preferred license terms.

---

## 🌟 Features Summary

✅ **Multi-device testing** (Mobile & Desktop)  
✅ **Automated Gist uploads** with GitHub integration  
✅ **Beautiful CLI output** with emojis and progress indicators  
✅ **Comprehensive test coverage** with Jest  
✅ **TypeScript support** with ES modules  
✅ **Dry-run mode** for safe testing  
✅ **Clean architecture** for maintainability  
✅ **Easy configuration** for different websites  
✅ **Detailed performance metrics** and summaries

Perfect for teams wanting to automate and share web performance monitoring! 🚀
