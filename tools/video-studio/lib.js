// Quorum tutorial studio — shared production library.
// VO is synthesized per paragraph (edge-tts), so narration boundaries are
// computed exactly; the recording is choreographed against those boundaries
// and everything is assembled with ffmpeg.
const { chromium } = require('playwright-core')
const { execSync, execFileSync } = require('child_process')
const fs = require('fs')

const STUDIO = __dirname
const GAP = 0.55   // silence inserted between paragraphs
const LEAD = 0.30  // narration start offset in the final video
const TAIL = 4.0   // hold on outro card after narration ends
const BIAS = 0.15
const VOICE = 'en-US-JennyNeural'
const RATE = '-4%'
const APP = 'http://localhost:5173/'

const ALL = ['alitalia', 'judy', 'lee', 'courtney', 'charles', 'joe', 'nancy']
const BASE_SEED = {
  sessionUserId: 'alitalia',
  screen: 'dashboard',
  tasks: Object.fromEntries(['articles', 'ein', 'orgmeeting', 'bylaws', 'officers', 'office', 'fiscalyear', 'nocomp'].map(t => [t, true])),
  sig: {
    minutes: Object.fromEntries(ALL.map(m => [m, true])),
    bylaws: { alitalia: true, judy: true, lee: true },
  },
  calConnected: true,
  zoomConnected: true,
  theme: 'warm',
  setupDismissed: true,
}

const sh = c => execSync(c, { stdio: 'pipe' }).toString().trim()
const dur = f => parseFloat(sh(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${f}"`))
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ---------------------------------------------------------------- voiceover
function buildVoiceover(spec) {
  const dir = `${STUDIO}/vo/${spec.slug}`
  fs.mkdirSync(dir, { recursive: true })
  const durs = []
  for (let i = 0; i < spec.paragraphs.length; i++) {
    const f = `${dir}/p${i}.mp3`
    if (!fs.existsSync(f) || fs.statSync(f).size < 500) {
      execFileSync('edge-tts', ['--voice', spec.voice || VOICE, `--rate=${spec.rate || RATE}`, '--text', spec.paragraphs[i], '--write-media', f], { stdio: 'pipe' })
    }
    durs.push(dur(f))
  }
  // concat: decode to wav, insert GAP silences, encode m4a
  const parts = []
  sh(`ffmpeg -v error -f lavfi -i anullsrc=r=44100:cl=mono -t ${GAP} -y ${dir}/gap.wav`)
  for (let i = 0; i < durs.length; i++) {
    sh(`ffmpeg -v error -i ${dir}/p${i}.mp3 -ar 44100 -ac 1 -y ${dir}/p${i}.wav`)
    parts.push(`file 'p${i}.wav'`)
    if (i < durs.length - 1) parts.push(`file 'gap.wav'`)
  }
  fs.writeFileSync(`${dir}/list.txt`, parts.join('\n'))
  sh(`ffmpeg -v error -f concat -safe 0 -i ${dir}/list.txt -c:a aac -b:a 160k -y ${dir}/vo.m4a`)
  // paragraph start times in the FINAL video timeline
  const starts = []
  let t = LEAD
  for (let i = 0; i < durs.length; i++) { starts.push(t); t += durs[i] + GAP }
  const audioEnd = LEAD + durs.reduce((a, b) => a + b, 0) + GAP * (durs.length - 1)
  return { dir, durs, starts, audioEnd }
}

// ------------------------------------------------------------------- cards
async function makeCards(spec, browser) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const intro = `<!doctype html><meta charset="utf-8"><body style="margin:0;width:1920px;height:1080px;display:flex;align-items:center;justify-content:center;background:radial-gradient(1200px 800px at 40% 35%, #b06a45 0%, #a15c39 45%, #8a4c2e 100%);font-family:Georgia,'DejaVu Serif',serif">
<div style="text-align:center;color:#fff">
  <div style="width:120px;height:120px;border-radius:28px;background:rgba(255,255,255,.14);border:1.5px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;margin:0 auto 38px;font-size:64px;">Q</div>
  <div style="font-size:88px;letter-spacing:.5px">Quorum</div>
  <div style="font-family:'DejaVu Sans',sans-serif;font-size:26px;letter-spacing:6px;text-transform:uppercase;opacity:.85;margin-top:18px">The Nonprofit Board OS</div>
  <div style="font-family:'DejaVu Sans',sans-serif;font-size:22px;opacity:.75;margin-top:70px">Tutorial ${spec.num} &nbsp;·&nbsp; ${esc(spec.title)}</div>
</div></body>`
  const outroInner = spec.next
    ? `<div style="font-family:'DejaVu Sans',sans-serif;font-size:24px;letter-spacing:5px;text-transform:uppercase;color:#8b8074">Next up</div>
       <div style="font-size:60px;color:#a15c39;margin-top:22px;padding:0 120px;line-height:1.25">${esc(spec.next)}</div>`
    : `<div style="font-size:60px;color:#a15c39;line-height:1.25">You&rsquo;re all set.</div>
       <div style="font-family:'DejaVu Sans',sans-serif;font-size:24px;color:#8b8074;margin-top:26px">Thanks for watching the whole series.</div>`
  const outro = `<!doctype html><meta charset="utf-8"><body style="margin:0;width:1920px;height:1080px;display:flex;align-items:center;justify-content:center;background:#faf4ed;font-family:Georgia,'DejaVu Serif',serif">
<div style="text-align:center;color:#332b24">
  <div style="width:96px;height:96px;border-radius:22px;background:#a15c39;color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 44px;font-size:52px;">Q</div>
  ${outroInner}
  <div style="font-family:'DejaVu Sans',sans-serif;font-size:22px;color:#8b8074;margin-top:66px">Quorum · Founder &amp; Board Portal tutorials</div>
</div></body>`
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  for (const [name, html] of [['intro', intro], ['outro', outro]]) {
    await page.setContent(html)
    await page.waitForTimeout(120)
    await page.screenshot({ path: `${STUDIO}/out/${spec.slug}-card-${name}.png` })
  }
  await page.close()
}

// ---------------------------------------------------------------- recorder
async function record(spec, tl) {
  const recDir = `${STUDIO}/rec/${spec.slug}`
  fs.rmSync(recDir, { recursive: true, force: true })
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    headless: true,
    args: ['--hide-scrollbars', '--font-render-hinting=none', '--force-color-profile=srgb'],
  })
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: recDir, size: { width: 1920, height: 1080 } },
  })
  const seed = { ...BASE_SEED, ...(spec.seed || {}) }
  await ctx.addInitScript(s => localStorage.setItem('ail_portal_prod_v1', JSON.stringify(s)), seed)
  const page = await ctx.newPage()
  await page.goto(APP, { waitUntil: 'domcontentloaded' })
  if (seed.sessionUserId) await page.waitForSelector('text=WORKSPACE', { timeout: 40000 })
  else await page.waitForSelector('input.inp', { timeout: 40000 })
  await sleep(400)

  await page.evaluate(() => {
    const c = document.createElement('div')
    c.id = '__cur'
    c.style.cssText = 'position:fixed;left:-40px;top:-40px;width:26px;height:26px;border-radius:50%;background:rgba(161,92,57,.28);border:2.5px solid #a15c39;box-shadow:0 1px 6px rgba(0,0,0,.28);z-index:2147483647;pointer-events:none;margin:-13px 0 0 -13px'
    document.body.appendChild(c)
    addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px' }, true)
    const k = document.createElement('div')
    k.style.cssText = 'position:fixed;right:2px;bottom:2px;width:3px;height:3px;z-index:2147483647;pointer-events:none;opacity:.06;background:#000'
    document.body.appendChild(k)
    let f = 0
    ;(function spin() { k.style.transform = `rotate(${f++}deg)`; requestAnimationFrame(spin) })()
    addEventListener('mousedown', e => {
      const r = document.createElement('div')
      r.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:14px;height:14px;border-radius:50%;border:3px solid #a15c39;z-index:2147483646;pointer-events:none;margin:-7px 0 0 -7px;opacity:.9;transition:all .45s ease-out`
      document.body.appendChild(r)
      requestAnimationFrame(() => { r.style.width = '64px'; r.style.height = '64px'; r.style.margin = '-32px 0 0 -32px'; r.style.opacity = '0' })
      setTimeout(() => r.remove(), 600)
    }, true)
    for (const el of document.querySelectorAll('div'))
      if (el.textContent.trim().startsWith('Demo:') && el.children.length <= 6 && el.textContent.length < 400) el.style.display = 'none'
  })
  await page.mouse.move(1100, 640)

  const t0 = Date.now()
  const api = {
    page,
    sleep,
    p: i => tl.starts[i],                      // paragraph i start (final-video time)
    end: i => tl.starts[i] + tl.durs[i],
    at: async sec => { const w = t0 + (sec + BIAS) * 1000 - Date.now(); if (w > 0) await sleep(w) },
    move: async (x, y, ms = 700) => { await page.mouse.move(x, y, { steps: Math.max(8, Math.round(ms / 16)) }) },
    hover: async (sel, ms = 700) => {
      const loc = page.locator(sel).first()
      let b = await loc.boundingBox().catch(() => null)
      if (b && (b.y < 80 || b.y + b.height > 1050)) {
        await loc.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' })).catch(() => {})
        await sleep(900)
        b = await loc.boundingBox().catch(() => null)
      }
      if (b) await api.move(b.x + b.width / 2, b.y + b.height / 2, ms)
      else console.warn('MISS', sel)
      return b
    },
    click: async (sel, ms = 650) => {
      const b = await api.hover(sel, ms)
      if (b) { await page.mouse.down(); await sleep(90); await page.mouse.up() }
    },
    clickNav: async label => api.click(`text="${label}"`),
    type: async (sel, text, delay = 45) => { await api.click(sel, 450); await page.type(sel, text, { delay }) },
    wheel: async (dy, times, pause = 550) => { for (let i = 0; i < times; i++) { await page.mouse.wheel(0, dy); await sleep(pause) } },
    scrollTo: async (sel, ms = 1400) => {
      await page.locator(sel).first().evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' })).catch(() => {})
      await sleep(ms)
    },
    backdrop: async () => { await api.move(230, 560, 500); await page.mouse.down(); await sleep(80); await page.mouse.up() },
  }

  try {
    await spec.actions(api)
  } finally {
    await api.at(tl.audioEnd + TAIL)
    const elapsed = (Date.now() - t0) / 1000
    await ctx.close()
    await browser.close()
    const webm = fs.readdirSync(recDir).find(f => f.endsWith('.webm'))
    fs.writeFileSync(`${recDir}/meta.json`, JSON.stringify({ elapsed, webm }))
  }
}

// ---------------------------------------------------------------- assembly
function assemble(spec, tl) {
  const recDir = `${STUDIO}/rec/${spec.slug}`
  const meta = JSON.parse(fs.readFileSync(`${recDir}/meta.json`, 'utf8'))
  const webm = `${recDir}/${meta.webm}`
  const trim = Math.max(0, dur(webm) - meta.elapsed)
  const introEnd = tl.starts[1] // brand line P0 plays over the intro card
  const last = tl.starts.length - 1
  const outroStart = tl.starts[last] + 0.6 * tl.durs[last]
  const total = +(tl.audioEnd + TAIL - 0.3).toFixed(2)

  const filters = []
  filters.push(`[0:v]fps=30,setpts=PTS-STARTPTS[base]`)
  filters.push(`[1:v]format=rgba,fade=t=out:st=${(introEnd - 0.4).toFixed(2)}:d=0.5:alpha=1[intro]`)
  filters.push(`[2:v]format=rgba,fade=t=in:st=${outroStart.toFixed(2)}:d=0.6:alpha=1[outro]`)
  filters.push(`[base][intro]overlay=0:0:enable='lt(t,${(introEnd + 0.2).toFixed(2)})'[v1]`)
  let cur = 'v1', n = 2
  for (const ov of spec.overlays || []) {
    const ts = tl.starts[ov.p] + 0.5
    const te = ts + Math.min(ov.dur || 5.5, tl.durs[ov.p])
    const text = ov.text.replace(/'/g, '’')
    filters.push(`[${cur}]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${text}':fontsize=42:fontcolor=white:box=1:boxcolor=0xa15c39@0.94:boxborderw=18:x=80:y=h-170:alpha='if(lt(t,${(ts + 0.4).toFixed(2)}),(t-${ts.toFixed(2)})/0.4,if(lt(t,${(te - 0.4).toFixed(2)}),1,max(0,(${te.toFixed(2)}-t)/0.4)))':enable='between(t,${ts.toFixed(2)},${te.toFixed(2)})'[v${n}]`)
    cur = `v${n}`; n++
  }
  filters.push(`[${cur}][outro]overlay=0:0:enable='gte(t,${outroStart.toFixed(2)})'[vout]`)
  filters.push(`[3:a]adelay=${Math.round(LEAD * 1000)}|${Math.round(LEAD * 1000)},apad[aout]`)
  fs.writeFileSync(`${STUDIO}/out/${spec.slug}-filters.txt`, filters.join(';\n'))

  const out = `${STUDIO}/out/${spec.slug}.mp4`
  sh(`ffmpeg -v warning -ss ${trim.toFixed(3)} -i "${webm}" -loop 1 -t ${(introEnd + 1).toFixed(2)} -i ${STUDIO}/out/${spec.slug}-card-intro.png -loop 1 -t ${total} -i ${STUDIO}/out/${spec.slug}-card-outro.png -i ${STUDIO}/vo/${spec.slug}/vo.m4a -filter_complex_script ${STUDIO}/out/${spec.slug}-filters.txt -map "[vout]" -map "[aout]" -t ${total} -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 160k -ar 44100 -movflags +faststart -y ${out}`)
  return { out, total }
}

// -------------------------------------------------------------------- VTT
function writeVtt(spec, tl) {
  const fmt = s => {
    const m = Math.floor(s / 60), sec = (s % 60).toFixed(3).padStart(6, '0')
    return `${String(m).padStart(2, '0')}:${sec}`
  }
  const wrap = t => {
    if (t.length <= 88) return t
    const words = t.split(' '); const lines = ['']
    for (const w of words) {
      if ((lines[lines.length - 1] + ' ' + w).trim().length > 88) lines.push(w)
      else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim()
    }
    return lines.join('\n')
  }
  const cues = spec.paragraphs.map((p, i) =>
    `${fmt(tl.starts[i])} --> ${fmt(tl.starts[i] + tl.durs[i] + 0.25)}\n${wrap(p)}`)
  fs.writeFileSync(`${STUDIO}/out/${spec.slug}.vtt`, 'WEBVTT\n\n' + cues.join('\n\n') + '\n')
}

async function produce(spec) {
  fs.mkdirSync(`${STUDIO}/out`, { recursive: true })
  const tl = buildVoiceover(spec)
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true })
  await makeCards(spec, browser)
  await browser.close()
  const canSkip = process.env.REASSEMBLE && fs.existsSync(`${STUDIO}/rec/${spec.slug}/meta.json`)
  if (!canSkip) await record(spec, tl)
  const { out, total } = assemble(spec, tl)
  writeVtt(spec, tl)
  console.log(`DONE ${spec.slug}: ${total}s, narration ${tl.audioEnd.toFixed(1)}s, paragraphs at [${tl.starts.map(s => s.toFixed(1)).join(', ')}]`)
  return { out, tl }
}

module.exports = { produce, BASE_SEED, ALL }
