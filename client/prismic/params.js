import startOfTomorrow from 'date-fns/start_of_tomorrow'
import formatDate from 'date-fns/format'
import isToday from 'date-fns/is_today'
import subDays from 'date-fns/sub_days'
import addDays from 'date-fns/add_days'
import startOfDay from 'date-fns/start_of_day'
import startOfMonth from 'date-fns/start_of_month'
import endOfMonth from 'date-fns/end_of_month'
import * as Predicates from 'prismic/predicates'
import * as types from 'constants/prismic'

export function uid({ type, uid }) {
    return {
        predicates: [Predicates.uid(type, uid)],
    }
}

export function all(type) {
    return {
        predicates: [Predicates.type(type)],
    }
}

export function ids(ids) {
    return {
        predicates: [Predicates.in('document.id', ids)],
        pageSize: ids.length,
    }
}

export const mw = {
    forecast(date) {
        if (date && !isToday(date)) {
            return {
                predicates: [
                    Predicates.field(
                        types.WEATHER_FORECAST,
                        'date',
                        formatDate(date, DATE)
                    ),
                ],
            }
        } else {
            return {
                predicates: [
                    Predicates.type(types.WEATHER_FORECAST),
                    Predicates.dateBefore(
                        `my.${types.WEATHER_FORECAST}.date`,
                        startOfTomorrow()
                    ),
                ],
                pageSize: 1,
                orderings: [`my.${types.WEATHER_FORECAST}.date desc`],
            }
        }
    },
    tutorial(id) {
        return uid({
            type: types.WEATHER_TUTORIAL,
            uid: id,
        })
    },
}

export function tutorial(slug) {
    return {
        predicates: [Predicates.field(types.TUTORIAL_PAGE, 'slug', slug)],
    }
}

export function sponsor(id) {
    return uid({
        type: types.SPONSOR,
        uid: id,
    })
}

export function generic(id) {
    return uid({
        type: types.GENERIC,
        uid: id,
    })
}

export const fatal = {
    accident(id) {
        return uid({
            type: types.FATAL_ACCIDENT,
            uid: id,
        })
    },
    accidents() {
        return all(types.FATAL_ACCIDENT)
    },
}

export const toyota = {
    truck(id) {
        return uid({
            type: types.TOYOTA_TRUCK_REPORT,
            uid: id,
        })
    },
    trucks() {
        return all(types.TOYOTA_TRUCK_REPORT)
    },
}

export const special = {
    report(id) {
        return uid({
            type: types.SPECIAL_INFORMATION,
            uid: id,
        })
    },
    reports() {
        return all(types.SPECIAL_INFORMATION)
    },
}

export const hzr = {
    region(name, date) {
        const { HOTZONE_REPORT } = types

        return {
            predicates: [
                Predicates.field(HOTZONE_REPORT, 'region', name),
                ...rangePredicates(
                    `my.${HOTZONE_REPORT}.dateOfIssue`,
                    `my.${HOTZONE_REPORT}.validUntil`,
                    date
                ),
            ],
            options: {
                pageSize: 1,
                orderings: [`my.${HOTZONE_REPORT}.dateOfIssue desc`],
            },
        }
    },
    uid(id) {
        return uid({
            type: types.HOTZONE_REPORT,
            uid: id,
        })
    },
    reports: {
        monthly(region, date) {
            const { HOTZONE_REPORT } = types
            const start = formatDate(startOfMonth(date), DATE)
            const end = formatDate(endOfMonth(date), DATE)

            return {
                predicates: [
                    Predicates.field(HOTZONE_REPORT, 'region', region),
                    Predicates.dateBefore(
                        `my.${HOTZONE_REPORT}.dateOfIssue`,
                        end
                    ),
                    Predicates.dateAfter(
                        `my.${HOTZONE_REPORT}.validUntil`,
                        start
                    ),
                ],
            }
        },
    },
}

export function highlight() {
    return range(types.HIGHLIGHT)
}

export function spaw() {
    return range(types.SPAW)
}

export const glossary = {
    glossary() {
        return {
            ...FETCH_DEFINITION_TITLE_OPTIONS,
            ...uid({
                type: types.GLOSSARY,
                uid: 'glossary',
            }),
        }
    },
    definition(id) {
        return {
            ...FETCH_DEFINITION_TITLE_OPTIONS,
            ...uid({
                type: types.DEFINITION,
                uid: id,
            }),
        }
    },
    definitions() {
        return {
            ...FETCH_DEFINITION_TITLE_OPTIONS,
            predicates: [Predicates.type(types.DEFINITION)],
        }
    },
}

export const feed = {
    splash({ type, tags }) {
        const predicates = [Predicates.type(type)]

        if (Array.isArray(tags) && tags.length > 0) {
            predicates.push(Predicates.tags(Array.from(tags)))
        }

        if (type === types.EVENT) {
            predicates.push(
                Predicates.dateAfter(
                    `my.${types.EVENT}.start_date`,
                    formatDate(new Date(), DATE)
                )
            )
        }

        return {
            predicates,
            pageSize: 5,
            orderings: [FEED_ORDERINGS.get(type)],
        }
    },
    sidebar({ type, uid }) {
        const predicates = [
            Predicates.type(type),
            Predicates.not(`my.${type}.uid`, uid),
        ]
        let ordering

        // TODO: Reuse a bit of the functions from FeedSplash container
        if (type === types.EVENT) {
            predicates.push(
                Predicates.dateAfter(
                    `my.${types.EVENT}.start_date`,
                    formatDate(startOfTomorrow(), DATE)
                )
            )
            ordering = `my.${types.EVENT}.start_date`
        } else {
            predicates.push(Predicates.tags('featured'))
            ordering = `my.${type}.date desc`
        }

        return {
            predicates,
            pageSize: 7,
            orderings: [ordering],
        }
    },
    blog({ year, month, category, page = 1, pageSize = 10 }) {
        const type = types.BLOG
        const predicates = [Predicates.type(type)]

        if (year) {
            predicates.push(Predicates.year(`my.${type}.date`, year))
        }

        if (month) {
            predicates.push(Predicates.month(`my.${type}.date`, month))
        }

        if (category) {
            predicates.push(Predicates.at(`my.${type}.category`, category))
        }

        return {
            page,
            pageSize,
            predicates,
            orderings: [FEED_ORDERINGS.get(type)],
        }
    },
    news({ year, month, tags, page = 1, pageSize = 10 }) {
        const type = types.NEWS
        const predicates = [Predicates.type(type)]

        if (year) {
            predicates.push(Predicates.year(`my.${type}.date`, year))
        }

        if (month) {
            predicates.push(Predicates.month(`my.${type}.date`, month))
        }

        if (tags.size) {
            predicates.push(Predicates.tags(Array.from(tags)))
        }

        return {
            page,
            pageSize,
            predicates,
            orderings: [FEED_ORDERINGS.get(type)],
        }
    },
    events({ past = false, tags = new Set(), page = 1, pageSize = 10 }) {
        const type = types.EVENT
        const ordering = past
            ? `${FEED_ORDERINGS.get(type)} desc`
            : FEED_ORDERINGS.get(type)
        const predicate = past ? Predicates.dateBefore : Predicates.dateAfter
        const timestamp = startOfDay(new Date()).getTime()
        const predicates = []

        predicates.push(predicate(`my.${type}.end_date`, timestamp))

        if (tags.size) {
            predicates.push(Predicates.tags(Array.from(tags)))
        }

        return {
            page,
            pageSize,
            predicates,
            orderings: [ordering],
        }
    },
}

export function tags({ type, page = 1 }) {
    return {
        predicates: [Predicates.type(type)],
        fetch: 'document.tags',
        pageSize: MAX_PAGE_SIZE,
        page,
    }
}

// Contants and utils
const MAX_PAGE_SIZE = 100
const DATE = 'YYYY-MM-DD'
const FETCH_DEFINITION_TITLE_OPTIONS = {
    fetchLinks: 'definition.title',
    pageSize: 1000,
}
function rangePredicates(start, end, date = new Date()) {
    return [
        Predicates.dateBefore(start, formatDate(addDays(date, 1), DATE)),
        Predicates.dateAfter(end, formatDate(subDays(date, 1), DATE)),
    ]
}
function range(type) {
    return {
        predicates: [
            Predicates.type(type),
            ...rangePredicates(`my.${type}.start`, `my.${type}.end`),
        ],
    }
}
const FEED_ORDERINGS = new Map([
    [types.NEWS, `my.${types.NEWS}.date desc`],
    [types.BLOG, `my.${types.BLOG}.date desc`],
    [types.EVENT, `my.${types.EVENT}.start_date`],
])
const MONTHS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
]
