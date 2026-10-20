# Portfolio-8

Personal portfolio website showcasing projects and work. The site is primarily built with HTML, CSS and JavaScript with a small amount of PHP (for contact form or server-side snippets).

## Stack
- Languages: HTML, CSS, JavaScript, PHP
- Primary use: static portfolio site with optional PHP back-end for contact forms

## Features
- Responsive layout for desktop and mobile
- Project showcase sections with images and links
- Contact form (may use PHP endpoint)

## How to run locally
If the project is a static site (no server-side PHP required):

```bash
# Using Python 3 (simple static server)
cd path/to/repo
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

If the site uses the included PHP contact form or other PHP code:

```bash
# Use PHP's built-in web server
cd path/to/repo
php -S localhost:8000
# then open http://localhost:8000 in your browser
```

Alternatively, use your editor's Live Server extension or any static host (GitHub Pages, Netlify, Vercel) for deployment. If you use GitHub Pages and the site is pure static HTML/CSS/JS, enable Pages for the default branch.

## Deployment suggestions
- For static hosting: GitHub Pages, Netlify, Vercel — push the repo and follow their guides.
- For PHP contact form: deploy to a host that supports PHP (shared hosting, DigitalOcean with LAMP/LEMP, etc.)
- Use a CDN for images and static assets to improve performance.

## Performance notes / quick wins
- Optimize and serve images in modern formats (WebP/AVIF) and include responsive srcset.
- Minify and bundle CSS/JS where appropriate.
- Enable server-side compression (gzip/Brotli) and long cache headers for static assets.

## Contributing
- Fixes, improvements, and pull requests are welcome.
- If you add tooling (npm, build step), include instructions in this README.

## License
Add a LICENSE file or clarify the intended license for this project.
