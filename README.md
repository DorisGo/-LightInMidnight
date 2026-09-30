# 🌙 Light In Midnight

> A quiet place to leave traces of life.
>
> 通过记录感知自己的存在

Light In Midnight 记录你与书、电影、音乐、地点和日常的每一次相遇，
再用日历、相册和星图，让你在回望时看见自己。

---

## Screenshots

<table>
<tr>
<td align="center">
<img src="https://github.com/user-attachments/assets/dc6204f9-0042-4206-9318-520e8ef102fa" width="260"/><br/>
主页
</td>
<td align="center">
<img src="https://github.com/user-attachments/assets/bbef52a7-114e-4216-bf48-cdac504ffa6b" width="260"/><br/>
Timeline
</td>
<td align="center">
<img src="https://github.com/user-attachments/assets/7b2e7e3f-6758-4652-a1dc-36893c540df0" width="260"/><br/>
设置
</td>
</tr>
<tr>
<td align="center">
<img src="https://github.com/user-attachments/assets/3dce6275-2401-4b9b-9bed-eb36863b5674" width="260"/><br/>
Trace Detail
</td>
<td align="center">
<img src="https://github.com/user-attachments/assets/9b394f8d-9f39-474a-a72d-00bccbc1eaf0" width="260"/><br/>
Trace Detail
</td>
</tr>
</table>

---

## Features

### ✨ Traces, not entries
Every record is a **trace** — one encounter between you and the world.
Some last a moment: a film, an album, an evening walk.
Some last a while: a book, a series. Those are kept as a span, from the day it began to the day it ended — still with it, finished, or simply set aside.

### 🔍 Covers, found for you
Type a title and Light In Midnight looks it up across books, films, series and music at once, bringing back the cover, author or director, and year. Nothing found? It stays a trace in your own words.

### 🗓 Four ways to look back

| View | 像什么 |
|------|--------|
| **Calendar** | 一个月的日历。当天遇见的封面落在格子里；书是一条细线，选中后展开成带书名的色带 |
| **Week** | 一本相册。日期安静地靠在左边，封面像书架上的书一样排在右边 |
| **Month** | 按日期排列的列表 |
| **Year** | 一张星图。一年是一个圆，瞬间是星星，读过的书是内圈的弧线，同一个月的星星连成星座 |

### 🕯 Paper & Night
Three palettes — **Candle** (default), **Indigo** and **Amber** — each in two moods:
**Paper** for the day, **Night** for the dark.
In Paper, the year can glow like a night sky or be printed like an old ink star atlas.

### 🎨 Shape Preferences
Choose how each kind of trace appears on the canvas.

### 💾 Yours, on your device
Traces are saved in your browser (LocalStorage). No account, no feed, no followers.

---

## Philosophy

Your traces are not achievements.

They are simply moments that became part of your life.

## Why Light In Midnight?

Most apps encourage us to quantify life.

Reading streaks.

Movie counts.

Daily check-ins.

Light In Midnight chooses another way.

It isn't about productivity.

It is about quietly leaving traces of the books, movies, music, places, and moments that became part of our lives.

Because recording makes us feel our existence.

---

## Getting Started

Requires Node.js 18 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Two design playgrounds live alongside the app:

- `/lab` — compare Paper and Night across every palette
- `/lab/add` — try the new input-first way of leaving a trace

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + Vite |
| Routing | React Router |
| State | Context API |
| Styling | Plain CSS with theme tokens |
| Data | LocalStorage |
| Catalog & covers | [NeoDB](https://neodb.social) public API |

---

## Project Structure

```
src
├── components
│   ├── add          # input-first quick add sheet
│   ├── canvas       # trace symbols on the home canvas
│   ├── home         # home page, add flow, trace preview
│   ├── settings     # appearance and shape preferences
│   ├── timeline     # calendar, week album, year star map
│   └── trace        # trace form, cover search, thumbnails
├── context          # traces, appearance, shape preferences
├── lab              # design playgrounds (/lab, /lab/add)
├── lib              # calendar, star map, catalog, placement
├── models           # trace and appearance data models
└── pages
docs                 # product vision and philosophy
```

---

## Future

- Bring the input-first add flow into the app
- A home canvas that grows with every trace
- Month as a wall of covers
- Cloud sync
- Export
- Search

---

Book, film and music data courtesy of [NeoDB](https://neodb.social).
