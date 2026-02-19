export class GetToken {
  static getToken(dryRun: boolean = false): string {
    if (dryRun) {
      return "dummy_token_for_dry_run";
    }

    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("You need to define GH_TOKEN or use GITHUB_TOKEN from Actions");
    }
    return token;
  }
}