import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Jas 的筆記",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "zh-TW",
    baseUrl: "jasboughtit.com/blog",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "IBM Plex Mono",
        body: "IBM Plex Sans",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#FAFAF7",
          lightgray: "#D4D6D0",
          gray: "#6B7268",
          darkgray: "#1B1F1A",
          dark: "#0E1411",
          secondary: "#D97706",
          tertiary: "#0F766E",
          highlight: "rgba(217, 119, 6, 0.10)",
          textHighlight: "#FBBF2444",
        },
        darkMode: {
          light: "#0E1411",
          lightgray: "#1F2A23",
          gray: "#7A8278",
          darkgray: "#E5E7E0",
          dark: "#FAFAF7",
          secondary: "#FBBF24",
          tertiary: "#5EEAD4",
          highlight: "rgba(251, 191, 36, 0.10)",
          textHighlight: "#FBBF2433",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [
      // 設 QUARTZ_INCLUDE_DRAFTS=true 可在本地預覽 draft 文章；正式 build 不要設
      ...(process.env.QUARTZ_INCLUDE_DRAFTS === "true" ? [] : [Plugin.RemoveDrafts()]),
    ],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
