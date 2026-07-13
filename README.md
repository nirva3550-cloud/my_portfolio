#  NIRVA SATANI — Developer Portfolio

A modern, responsive, single-page portfolio built with plain HTML5, CSS3
and vanilla JavaScript (no frameworks), with a contact form that saves
submissions straight into a Google Sheet via Google Apps Script.

```
Portfolio/
│── index.html        Markup for every section
│── style.css          All styling (theme, layout, responsive, animations)
│── script.js           All interactivity (see in-file comments)
│── Code.gs              Google Apps Script backend for the contact form
│── images/                 Put your photos/screenshots here
│── resume/                 Put your resume PDF here
│── README.md                 You are here
```

---

## 1. Personalize the content

Open `index.html` and replace the placeholders:

| What | Where |
|---|---|
| Name, title, intro | `<section id="hero">` |
| Profile photo | `images/profile.jpg` |
| Resume file | `resume/Alex_Carter_Resume.pdf` (update both `<a href>` links in the Hero and Resume sections if you rename it) |
| About / education / experience | `<section id="about">` |
| Skill percentages | `data-width` attribute on each `.progress-fill` in `<section id="skills">` |
| Projects (images, description, tech, links) | `<section id="projects">` — each `<article class="project-card">` |
| Services | `<section id="services">` |
| Testimonials | `<section id="testimonials">` |
| Social links & email/phone | Hero, Contact and Footer sections (search for `yourusername` / `example.com`) |

Until you add your own images, the site automatically falls back to
placeholder graphics (via each `<img>`'s `onerror` attribute), so nothing
will look broken while you're customizing.

### Fonts & icons
Poppins and JetBrains Mono are loaded from Google Fonts, and icons come
from Font Awesome — both via CDN `<link>` tags already in `<head>`, so
no extra setup is required as long as the page has an internet connection.

---

## 2. Connect the contact form to Google Sheets

The contact form posts to a **Google Apps Script Web App**, which appends
each submission as a new row in a Google Sheet.

### Step 1 — Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it something like **Portfolio Contacts**.
3. You don't need to add headers manually — the script creates a
   `Contacts` tab with headers (`Timestamp, Name, Email, Phone, Subject, Message`)
   automatically the first time it runs.

### Step 2 — Add the Apps Script
1. In the spreadsheet, go to **Extensions → Apps Script**.
2. Delete any starter code in the editor.
3. Copy the entire contents of `Code.gs` (included in this project) and paste it in.
4. Click the **Save** icon (or `Ctrl/Cmd + S`).

### Step 3 — Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure:
   - **Description**: `Portfolio contact form`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (required so the public form can reach it)
4. Click **Deploy**.
5. Authorize the app when prompted (click through the Google "unverified app" warning — this is expected for personal scripts you wrote yourself).
6. Copy the **Web app URL** shown after deployment. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

### Step 4 — Connect it to the site
1. Open `script.js`.
2. Find this line near the top:
   ```js
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
   ```
3. Replace the placeholder URL with the Web App URL you copied.
4. Save the file and reload the page — the form will now write directly to your sheet.

### Redeploying after edits
If you ever change `Code.gs`, you must create a **New deployment** (or
manage the existing one via **Deploy → Manage deployments → Edit → New version**)
for the changes to take effect — saving alone is not enough.

---

## 3. How the form works (client side)

- **Validation**: `script.js` checks that name, email, subject and message
  are filled in, that the email looks valid, and that the phone number
  (if provided) matches a sensible pattern — all before any network request
  is made. Invalid fields are outlined in red with an inline error message.
- **Loading state**: the submit button shows a spinner and disables itself
  while the request is in flight.
- **Success**: a green confirmation message appears and the form resets.
- **Failure**: a red error message appears (e.g. network issue, or the
  script hasn't been connected yet) without losing what the user typed.

---

## 4. Features included

- Glassmorphism cards, gradient accents, dark/light theme toggle (saved via `localStorage`)
- Fully responsive layout (mobile / tablet / desktop breakpoints)
- Smooth scrolling + scroll-triggered reveal animations
- Sticky navbar with active-section highlighting
- Typing text animation in the hero
- Animated counters and animated skill progress bars
- Project filtering by category, plus an image lightbox
- Auto-playing testimonial slider with manual controls
- Custom cursor and canvas particle background (both auto-disabled on touch devices where irrelevant)
- Back-to-top button
- Semantic HTML5 and ARIA labels for accessibility
- Contact form wired to Google Sheets via Apps Script

---

## 5. Browser support

Built with standard, widely supported CSS (custom properties, grid,
flexbox, `backdrop-filter`) and vanilla JS (`IntersectionObserver`,
`fetch`). Works in current versions of Chrome, Firefox, Safari and Edge.
`backdrop-filter` gracefully degrades to a solid translucent background
in browsers that don't support it.

---

## 6. Running locally

No build step is required. Just open `index.html` in a browser, or serve
the folder with any static server, e.g.:

```bash
npx serve .
```
