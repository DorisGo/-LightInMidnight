/**
 * Sample traces anchored to the current moment, so the home prototypes always
 * show "today" and "the last few days" whenever they are opened.
 */

/** @typedef {import('../models/trace').Trace} Trace */

const COVERS = {
  norwegian: 'https://neodb.social/m/book/2021/09/134af5adaf-cffe-4d55-9640-3d50e89e748e.jpg',
  threeBody: 'https://neodb.social/m/item/bangumi/2024/12/22/184db1d2-e3a0-4e55-8111-464c00d8e8c8.jpg',
  cheer: 'https://neodb.social/m/item/apple_music/2025/02/17/9e30749f-bf4b-4d3b-af10-a8d41e85b198.jpg',
  okComputer: 'https://neodb.social/m/album/2021/09/15b7c2da05-75f9-4d79-a1af-ec3025467aec.jpg',
  spirited: 'https://neodb.social/m/movie/2021/09/144ed58222-783e-4bf5-9563-399c6f0c2b3d.jpg',
  seaside: 'https://neodb.social/m/movie/2021/09/15ee70b478-4e7b-480e-8879-d4c2e12ac9c5.jpg',
}

/**
 * @param {number} daysAgo
 * @param {number} hour  fractional hour of the day
 */
function at(daysAgo, hour) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0)
  return date
}

let n = 0

/**
 * @param {Partial<Trace> & { memory: string, category: Trace['category'], daysAgo: number, hour: number }} fields
 * @returns {Trace}
 */
function trace({ daysAgo, hour, ...fields }) {
  n += 1
  const when = at(daysAgo, hour)
  return {
    id: `home-${n}`,
    occurredAt: when,
    recordedAt: when,
    mark: 'star',
    placement: { x: 0, y: 0, rotation: 0, scale: 1 },
    ...fields,
  }
}

/** A few moments per day, at the kinds of hours people actually live. */
const PAST = [
  [1, 8.2, 'music', '晨跑时的歌单'], [1, 21.5, 'movie', '海街日记', COVERS.seaside],
  [2, 12.7, 'place', '新开的面包店'], [2, 23.1, 'other', '和朋友打了很久的电话'],
  [3, 19.4, 'music', 'OK Computer', COVERS.okComputer], [3, 7.1, 'other', '早起看到的日出'],
  [3, 15.8, 'place', '公园里的银杏'],
  [4, 22.6, 'movie', '千与千寻', COVERS.spirited],
  [5, 10.2, 'other', '一封手写的信'], [5, 17.9, 'place', '雨后的街'], [5, 0.6, 'music', '深夜电台'],
  [6, 14.3, 'place', '美术馆'], [6, 20.8, 'music', '华丽的冒险', COVERS.cheer],
]

/** Earlier today — only the ones that have already happened. */
const TODAY = [
  [0, 7.6, 'other', '窗边的咖啡'],
  [0, 12.4, 'place', '午饭后散步'],
  [0, 16.2, 'music', '华丽的冒险', COVERS.cheer],
]

/**
 * @returns {Trace[]}
 */
export function buildHomeSample() {
  n = 0
  const nowHour = new Date().getHours() + new Date().getMinutes() / 60

  const moments = [...PAST, ...TODAY.filter(([, hour]) => hour < nowHour - 0.2)].map(
    ([daysAgo, hour, category, memory, cover]) =>
      trace({
        daysAgo: /** @type {number} */ (daysAgo),
        hour: /** @type {number} */ (hour),
        category: /** @type {Trace['category']} */ (category),
        memory: /** @type {string} */ (memory),
        ...(cover ? { cover: /** @type {string} */ (cover) } : {}),
      }),
  )

  const books = [
    trace({
      memory: '挪威的森林',
      subtitle: '村上春树',
      category: 'book',
      daysAgo: 9,
      hour: 22,
      cover: COVERS.norwegian,
      span: { status: 'ongoing', endedAt: null, sessions: [] },
    }),
    trace({
      memory: '三体',
      subtitle: '刘慈欣',
      category: 'book',
      daysAgo: 20,
      hour: 21,
      cover: COVERS.threeBody,
      span: { status: 'ongoing', endedAt: null, sessions: [] },
    }),
  ]

  return [...moments, ...books]
}

export { companions } from '../models/companions'
