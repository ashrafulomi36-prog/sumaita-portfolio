// sanity.js — Sanity client setup + data fetch/render helpers
// Loaded via <script type="module" src="sanity.js"></script> on each page

import { createClient } from 'https://esm.sh/@sanity/client'

const client = createClient({
  projectId: 'eocgzp90',
  dataset: 'production', // [EDIT] change if your dataset name differs
  apiVersion: '2026-01-01',
  useCdn: true
})

// ---------- safe runner — keeps static HTML if Sanity fails ----------
async function safeRender(fn, label) {
  try {
    await fn()
  } catch (err) {
    console.warn(`[sanity] ${label} failed — static fallback kept`, err)
  }
}

// ---------- Hero + About (index.html) ----------
async function renderHero() {
  const el = document.querySelector('[data-sanity="hero"]')
  if (!el) return
  const hero = await client.fetch(`*[_type == "hero"][0]{name, role, lead}`)
  if (!hero) return
  const name = el.querySelector('.js-name')
  const role = el.querySelector('.js-role')
  const lead = el.querySelector('.js-lead')
  if (hero.name && name) name.textContent = hero.name
  if (hero.role && role) role.textContent = hero.role
  if (hero.lead && lead) lead.textContent = hero.lead
}

async function renderAbout() {
  const el = document.querySelector('[data-sanity="about"]')
  if (!el) return
  const about = await client.fetch(`*[_type == "about"][0]{heading, body}`)
  if (!about) return
  const heading = el.querySelector('.js-heading')
  const body = el.querySelector('.js-body')
  if (about.heading && heading) heading.textContent = about.heading
  if (about.body && body) body.textContent = about.body
}

// ---------- Skills ----------
async function renderSkills() {
  const el = document.querySelector('[data-sanity="skills"]')
  if (!el) return
  const skills = await client.fetch(`*[_type == "skills"][0]{items}`)
  if (!skills?.items?.length) return
  el.innerHTML = skills.items.map(s => `<span class="skill-chip">${s}</span>`).join('')
}

// ---------- Projects (index.html preview + projects.html full grid) ----------
async function renderProjects() {
  const el = document.querySelector('[data-sanity="projects"]')
  if (!el) return
  const projects = await client.fetch(
    `*[_type == "project"] | order(date desc){title, summary, tech, date, "cover": cover.asset->url, githubUrl, liveUrl}`
  )
  if (!projects?.length) return
  el.innerHTML = projects.map(p => `
    <div class="card"><div class="card-inner"
      data-title="${p.title}"
      data-date="${formatDate(p.date)}"
      data-summary="${p.summary || ''}"
      data-tech="${(p.tech || []).join(', ')}">
      <p class="card-tag">${formatDate(p.date)}</p>
      <h3>${p.title}</h3>
      <p>${p.summary || ''}</p>
      <div class="tech">${(p.tech || []).map(t => `<span>${t}</span>`).join('')}</div>
    </div></div>
  `).join('')
  attachCardHandlers()
}

// ---------- Education ----------
async function renderEducation() {
  const el = document.querySelector('[data-sanity="education"]')
  if (!el) return
  const items = await client.fetch(`*[_type == "education"] | order(years desc){institution, degree, years, gpa}`)
  if (!items?.length) return
  el.innerHTML = items.map(e => `
    <div class="list-item">
      <div><strong>${e.institution}</strong><div class="meta">${e.degree}${e.gpa ? ' · GPA ' + e.gpa : ''}</div></div>
      <div class="meta">${e.years}</div>
    </div>
  `).join('')
}

// ---------- Certificates ----------
async function renderCertificates() {
  const el = document.querySelector('[data-sanity="certificates"]')
  if (!el) return
  const items = await client.fetch(`*[_type == "certificate"] | order(date desc){title, issuer, refId, date}`)
  if (!items?.length) return
  el.innerHTML = items.map(c => `
    <div class="list-item">
      <div><strong>${c.title}</strong><div class="meta">${c.issuer}${c.refId ? ' · ' + c.refId : ''}</div></div>
      <div class="meta">${formatDate(c.date)}</div>
    </div>
  `).join('')
}

// ---------- References (resume.html) ----------
async function renderReferences() {
  const el = document.querySelector('[data-sanity="references"]')
  if (!el) return
  const items = await client.fetch(`*[_type == "reference"]{name, email, phone}`)
  if (!items?.length) return
  el.innerHTML = items.map(r => `
    <div class="list-item">
      <div><strong>${r.name}</strong><div class="meta">${[r.email, r.phone].filter(Boolean).join(' · ')}</div></div>
    </div>
  `).join('')
}

// ---------- Contact ----------
async function renderContact() {
  const el = document.querySelector('[data-sanity="contact"]')
  if (!el) return
  const c = await client.fetch(`*[_type == "contact"][0]{phone, email, location}`)
  if (!c) return
  const email = el.querySelector('.js-email')
  const phone = el.querySelector('.js-phone')
  const location = el.querySelector('.js-location')
  if (c.email && email) {
    email.textContent = c.email
    email.href = `mailto:${c.email}`
  }
  if (c.phone && phone) {
    phone.textContent = c.phone
    phone.href = `tel:${c.phone.replace(/[^+\d]/g, '')}`
  }
  if (c.location && location) location.textContent = c.location
}

// ---------- Resume PDF download link ----------
async function renderResumeLink() {
  const btn = document.getElementById('resumeDownload')
  if (!btn) return
  const url = await client.fetch(`*[_type == "siteSettings"][0].resumeFile.asset->url`)
  if (url) btn.href = url
}

// ---------- helpers ----------
function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function attachCardHandlers() {
  // re-attach modal + tilt behavior to newly rendered cards (mirrors script.js)
  const modalBg = document.getElementById('modalBg')
  document.querySelectorAll('.card-inner').forEach(card => {
    card.addEventListener('click', () => {
      if (!modalBg) return
      modalBg.querySelector('.m-title').textContent = card.dataset.title
      modalBg.querySelector('.m-date').textContent = card.dataset.date
      modalBg.querySelector('.m-summary').textContent = card.dataset.summary
      modalBg.querySelector('.m-tech').textContent = card.dataset.tech
      modalBg.classList.add('open')
    })
    if (window.matchMedia('(hover:hover)').matches) {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(4px)`
      })
      card.addEventListener('mouseleave', () => { card.style.transform = 'rotateY(0) rotateX(0)' })
    }
  })
}

// run whatever applies to the current page (failures keep static HTML)
safeRender(renderHero, 'hero')
safeRender(renderAbout, 'about')
safeRender(renderSkills, 'skills')
safeRender(renderProjects, 'projects')
safeRender(renderEducation, 'education')
safeRender(renderCertificates, 'certificates')
safeRender(renderReferences, 'references')
safeRender(renderContact, 'contact')
safeRender(renderResumeLink, 'resume link')
