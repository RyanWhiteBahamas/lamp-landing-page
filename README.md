# LAMP Landing Page

Loyalty Advantage Membership Program (LAMP) - Healthcare plans landing page for Doctors Hospital.

## Setup

1. Add your logo file to `assets/images/logo.png`
2. Create a Formspree account at [formspree.io](https://formspree.io) and get your form endpoint
3. Update the form action in `index.html` with your Formspree endpoint:
   ```html
   <form id="enrollment-form" action="https://formspree.io/f/YOUR_ID" method="POST">
   ```

## Deployment

### Netlify
1. Push to GitHub
2. Connect repository to Netlify
3. Deploy settings are pre-configured in `netlify.toml`

### Vercel
1. Push to GitHub
2. Import repository in Vercel
3. Deploy with default settings

### GitHub Pages
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Select branch and root folder

## File Structure

```
lamp-landing-page/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles
├── js/
│   └── main.js             # JavaScript functionality
├── assets/
│   └── images/
│       ├── logo.png        # Your logo (add this)
│       └── doctor-consultation.jpg
├── netlify.toml            # Netlify deployment config
├── .gitignore
└── README.md
```

## Features

- Responsive design (mobile-first)
- Accessible (WCAG 2.1 compliant)
- SEO optimized
- Form integration ready (Formspree)
- No external dependencies (except Google Fonts)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
