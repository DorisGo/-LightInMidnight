/**
 * A made-up year of traces, so every theme is compared on the same data.
 */

/** @typedef {import('../models/trace').Trace} Trace */

const at = (/** @type {string} */ day) => new Date(`${day}T12:00:00`)

const COVERS = {
  moodForLove: 'https://neodb.social/m/item/doubanmovie/2025/02/20/5635dfa8-fc80-474c-b0c5-0a0355622311.jpg',
  spirited: 'https://neodb.social/m/movie/2021/09/144ed58222-783e-4bf5-9563-399c6f0c2b3d.jpg',
  seaside: 'https://neodb.social/m/movie/2021/09/15ee70b478-4e7b-480e-8879-d4c2e12ac9c5.jpg',
  sunrise: 'https://neodb.social/m/movie/2021/09/136381f7ca-9ae2-4568-a0fa-ae0b544878ee.jpg',
  fantasy: 'https://neodb.social/m/item/spotify_album/2025/01/11/6346de35-e343-4e67-ace4-93c892ba72d3.jpg',
  okComputer: 'https://neodb.social/m/album/2021/09/15b7c2da05-75f9-4d79-a1af-ec3025467aec.jpg',
  cheer: 'https://neodb.social/m/item/apple_music/2025/02/17/9e30749f-bf4b-4d3b-af10-a8d41e85b198.jpg',
  toLive: 'https://neodb.social/m/book/2021/09/1561f352a4-5276-4846-8e22-9287f21efd02.jpg',
  norwegian: 'https://neodb.social/m/book/2021/09/134af5adaf-cffe-4d55-9640-3d50e89e748e.jpg',
  threeBody: 'https://neodb.social/m/item/bangumi/2024/12/22/184db1d2-e3a0-4e55-8111-464c00d8e8c8.jpg',
  littlePrince: 'https://neodb.social/m/book/2021/09/1360f4c4c2-6b01-4adf-ad2b-3d202ff12ab2.jpg',
}

let n = 0

/**
 * @param {Partial<Trace> & { memory: string, category: Trace['category'], day: string }} fields
 * @returns {Trace}
 */
function trace({ day, ...fields }) {
  n += 1
  return {
    id: `sample-${n}`,
    occurredAt: at(day),
    recordedAt: at(day),
    mark: 'star',
    placement: { x: 0, y: 0, rotation: 0, scale: 1 },
    ...fields,
  }
}

/**
 * @param {string} memory
 * @param {string} day
 * @param {string|null} end
 * @param {'ongoing'|'finished'|'paused'} status
 * @param {string[]} sessions
 * @param {string} [cover]
 */
function book(memory, day, end, status, sessions, cover) {
  return trace({
    memory,
    category: 'book',
    day,
    ...(cover ? { cover } : {}),
    span: { status, endedAt: end ? at(end) : null, sessions },
  })
}

/** Background stars spread across the year so the star map has a sky. */
function scattered() {
  const cats = /** @type {Trace['category'][]} */ (['movie', 'music', 'place', 'other'])
  const out = []
  for (let month = 1; month <= 8; month++) {
    const count = 2 + ((month * 7) % 4)
    for (let i = 0; i < count; i++) {
      const date = String(1 + ((i * 11 + month * 5) % 27)).padStart(2, '0')
      out.push(trace({
        memory: `A small moment ${month}.${i + 1}`,
        category: cats[(month + i) % cats.length],
        day: `2026-${String(month).padStart(2, '0')}-${date}`,
      }))
    }
  }
  return out
}

/** @type {Trace[]} */
export const SAMPLE_TRACES = [
  ...scattered(),
  book('人类简史', '2026-01-05', '2026-02-20', 'finished', []),
  book('三体', '2026-04-01', '2026-06-10', 'finished', [], COVERS.threeBody),
  book('局外人', '2026-05-12', '2026-05-20', 'finished', []),
  book('追忆似水年华', '2026-06-20', '2026-07-30', 'paused', []),

  // September, the month shown on the calendar.
  book('百年孤独', '2026-08-25', '2026-09-09', 'paused', []),
  book('活着', '2026-09-03', '2026-09-15', 'finished',
    ['2026-09-04', '2026-09-07', '2026-09-08', '2026-09-12', '2026-09-15'], COVERS.toLive),
  book('挪威的森林', '2026-09-14', null, 'ongoing',
    ['2026-09-16', '2026-09-20', '2026-09-23'], COVERS.norwegian),
  trace({ memory: '花样年华', subtitle: '王家卫 · 2000', category: 'movie', day: '2026-09-06', cover: COVERS.moodForLove }),
  trace({ memory: '海街日记', subtitle: '是枝裕和 · 2015', category: 'movie', day: '2026-09-10', cover: COVERS.seaside }),
  trace({ memory: '范特西', subtitle: '周杰伦 · 2001', category: 'music', day: '2026-09-12', cover: COVERS.fantasy }),
  trace({ memory: '爱在黎明破晓前', subtitle: 'Richard Linklater · 1995', category: 'movie', day: '2026-09-18', cover: COVERS.sunrise }),
  trace({ memory: 'OK Computer', subtitle: 'Radiohead · 1997', category: 'music', day: '2026-09-18', cover: COVERS.okComputer }),
  trace({ memory: '海边的一次散步', category: 'place', day: '2026-09-20' }),
  trace({ memory: '千与千寻', subtitle: '宫崎骏 · 2001', category: 'movie', day: '2026-09-24', cover: COVERS.spirited }),
  trace({ memory: '华丽的冒险', subtitle: '陈绮贞 · 2005', category: 'music', day: '2026-09-24', cover: COVERS.cheer }),
  book('小王子', '2026-09-01', '2026-09-02', 'finished', [], COVERS.littlePrince),
]

export const SAMPLE_MONTH = new Date(2026, 8, 1)
