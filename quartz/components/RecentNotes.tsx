import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, SimpleSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import style from "./styles/recentNotes.scss"
import { Date, getDate } from "./Date"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface Options {
  title?: string
  limit: number
  linkToMore: SimpleSlug | false
  showTags: boolean
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  limit: 3,
  linkToMore: false,
  showTags: true,
  filter: () => true,
  sort: byDateAndAlphabetical(cfg),
})

export default ((userOpts?: Partial<Options>) => {
  const RecentNotes: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(cfg), ...userOpts }
    const pages = allFiles.filter(opts.filter).sort(opts.sort)
    const remaining = Math.max(0, pages.length - opts.limit)
    return (
      <div class={classNames(displayClass, "recent-notes")}>
        <h3>{opts.title ?? i18n(cfg.locale).components.recentNotes.title}</h3>
        <ul class="recent-ul">
          {pages.slice(0, opts.limit).map((page) => {
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            const tags = page.frontmatter?.tags ?? []
            const description = page.frontmatter?.description
            const heroSrc =
              (page.frontmatter as any)?.image ??
              (page.frontmatter as any)?.cover ??
              (page.frontmatter as any)?.socialImage
            const href = resolveRelative(fileData.slug!, page.slug!)

            return (
              <li class="recent-li">
                <a href={href} class="internal recent-card-link">
                  <div class="recent-card">
                    {heroSrc && (
                      <div class="recent-thumb">
                        <img src={heroSrc} alt="" loading="lazy" />
                      </div>
                    )}
                    <div class="section">
                      <div class="desc">
                        <h3 class="recent-title">{title}</h3>
                      </div>
                      {page.dates && (
                        <p class="meta">
                          <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                        </p>
                      )}
                      {description && <p class="recent-desc">{description}</p>}
                      {opts.showTags && tags.length > 0 && (
                        <ul class="tags">
                          {tags.map((tag) => (
                            <li>
                              <span class="tag-link">{tag}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
        {opts.linkToMore && remaining > 0 && (
          <p>
            <a href={resolveRelative(fileData.slug!, opts.linkToMore)}>
              {i18n(cfg.locale).components.recentNotes.seeRemainingMore({ remaining })}
            </a>
          </p>
        )}
      </div>
    )
  }

  RecentNotes.css = style
  return RecentNotes
}) satisfies QuartzComponentConstructor
