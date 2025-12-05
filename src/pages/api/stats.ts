const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const USERNAME = "rithvikvibhu";

// Simple in-memory cache
let cachedStats: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function fetchGitHubData() {
  const now = Date.now();
  if (cachedStats && now - lastFetchTime < CACHE_DURATION) {
    return cachedStats;
  }

  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN not set, returning mock data");
    const { default: mockStats } = await import("../../data/mock-stats.json");
    return mockStats;
  }

  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "Content-Type": "application/json",
  };

  const query = `
    query {
      user(login: "${USERNAME}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              name
              languages(first: 1, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  node {
                    name
                  }
                }
              }
            }
            contributions {
              totalCount
            }
          }
        }
        repositories(first: 1, orderBy: {field: PUSHED_AT, direction: DESC}, affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
          totalCount
        }
        pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
                title
                url
                createdAt
                merged
                repository {
                    name
                    isPrivate
                }
            }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });

    const responseJson = await response.json();

    // Handle GraphQL Errors (e.g., Bad Credentials)
    if (responseJson.errors) {
      console.error(
        "GitHub GraphQL Error:",
        JSON.stringify(responseJson.errors, null, 2),
      );
      throw new Error("GitHub API returned errors");
    }

    const user = responseJson.data?.user;

    // Handle null user (e.g. if username is wrong or other issues)
    if (!user) {
      console.error(
        "GitHub API returned no user data. Full response:",
        JSON.stringify(responseJson, null, 2),
      );
      throw new Error("GitHub API returned no user data");
    }

    // Process Languages (By Commit Count)
    const languageCounts: Record<string, number> = {};
    let totalCommitsWithLanguage = 0;

    const commitContribs =
      user.contributionsCollection?.commitContributionsByRepository || [];
    commitContribs.forEach((item: any) => {
      const repo = item.repository;
      const contributions = item.contributions?.totalCount || 0;

      if (contributions > 0 && repo?.languages?.edges?.length > 0) {
        let lang = repo.languages.edges[0].node.name;

        // Merge JavaScript and TypeScript
        if (lang === "TypeScript" || lang === "JavaScript")
          lang = "TypeScript / JavaScript";

        languageCounts[lang] = (languageCounts[lang] || 0) + contributions;
        totalCommitsWithLanguage += contributions;
      }
    });

    const topLanguages = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([language, count]) => ({
        language,
        percent:
          totalCommitsWithLanguage > 0
            ? Math.round((count / totalCommitsWithLanguage) * 100)
            : 0,
      }));

    // Process Sparkline (Last 30 days)
    const weeks =
      user.contributionsCollection?.contributionCalendar?.weeks || [];
    const days = weeks.flatMap((w: any) => w.contributionDays);
    const last30Days = days.slice(-30).map((d: any) => d.contributionCount);

    // Stats
    const commitsLast30Days = last30Days.reduce(
      (a: number, b: number) => a + b,
      0,
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Timeline construction
    const allTimeline: any[] = [];

    // Add PRs to timeline
    const prs = user.pullRequests?.nodes || [];
    prs.forEach((pr: any) => {
      allTimeline.push({
        date: pr.createdAt,
        type: "pr",
        summary: `${pr.merged ? "Merged" : "Opened"} PR in ${pr.repository.name}: ${pr.title}`,
        url: pr.url,
        isPrivate: pr.repository.isPrivate,
      });
    });

    // Calculate stats (Include Private)
    const prsLast30DaysCount = allTimeline.filter(
      (t) => t.type === "pr" && new Date(t.date) > thirtyDaysAgo,
    ).length;

    // Filter timeline for public display (Exclude Private)
    const publicTimeline = allTimeline.filter((t) => !t.isPrivate);

    // Sort timeline
    publicTimeline.sort(
      (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf(),
    );

    const result = {
      github: {
        commits_last_30_days: commitsLast30Days,
        prs_last_30_days: prsLast30DaysCount,
        repos_contributed_to: user.repositories?.totalCount || 0,
        top_languages: topLanguages,
        contribution_sparkline: last30Days,
      },
      timeline: publicTimeline.slice(0, 5), // Recent 5 items
    };

    // Update Cache
    cachedStats = result;
    lastFetchTime = now;

    return result;
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    const { default: mockStats } = await import("../../data/mock-stats.json");
    return mockStats;
  }
}

export const GET = async () => {
  const stats = await fetchGitHubData();

  return new Response(JSON.stringify(stats), {
    headers: {
      "Content-Type": "application/json",
      // Add caching headers for browser/CDN as well
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
