# Product Document

## 1. Product Overview

**Product name:** UnCommon Core Maps Maker  
**Type:** Client-side web application  
**Core purpose:** Turn real-world locations into high-resolution, printable or social-ready map posters with customizable styling.

UnCommon Core Maps Maker enables users to search for a location, style it in either standard or artistic map mode, configure typography and composition, then export a polished PNG at common preset sizes or custom dimensions.

---

## 2. Problem Statement

Users who want personalized map art often face one or more issues:

1. Existing tools are either too generic (limited style control) or too complex (GIS-heavy).
2. Export quality is often too low for print and poor for social formats.
3. Styling choices (map style, typography, overlay) are fragmented across different tools.
4. Many workflows require server processing or account setup, adding friction and privacy concerns.

This product solves those issues with an all-in-browser, focused poster creation flow.

---

## 3. Goals and Non-Goals

### 3.1 Product Goals

1. Let users generate poster-ready map images in under 2 minutes.
2. Provide visually distinct style options via dual rendering modes:
   - Standard raster tile mode for familiar map looks.
   - Artistic vector style mode for unique poster aesthetics.
3. Support high-resolution exports for social media, wallpaper, and print.
4. Preserve user settings between sessions for faster repeat creation.
5. Keep processing local to the browser wherever possible.

### 3.2 Non-Goals (Current Scope)

1. No user accounts, cloud save, or team collaboration.
2. No server-side rendering pipeline or queued batch jobs.
3. No PDF/SVG export in current version (PNG only).
4. No advanced GIS editing (route drawing, polygon editing, layers authoring).
5. No built-in e-commerce or print fulfillment integration.

---

## 4. Target Users

### 4.1 Primary Personas

1. **Gift Creator / Hobbyist**
   - Wants personalized city posters for home decor or gifts.
   - Values ease of use and fast output.

2. **Content Creator / Social Media Manager**
   - Needs visually strong location-based graphics quickly.
   - Values preset dimensions for Instagram, Stories, TikTok, etc.

3. **Designer / Small Studio**
   - Wants a fast base artwork that can be refined in design tools.
   - Values style control and high-resolution exports.

### 4.2 Jobs To Be Done

1. "When I want location art, help me find and style a place fast."
2. "When publishing on social, generate the right aspect ratio quickly."
3. "When preparing print art, give me large, clean image exports."

---

## 5. Value Proposition

UnCommon Core Maps Maker combines discovery, styling, composition, and export in one browser-based workflow. It removes tool switching and setup overhead while producing high-quality outputs suitable for digital and physical formats.

---

## 6. User Experience and Core Flow

### 6.1 Happy Path

1. User opens app.
2. Searches for city/location.
3. Chooses render mode (Standard or Artistic).
4. Selects map theme, zoom, overlay settings, and title font.
5. Chooses output size preset or custom dimensions.
6. Exports PNG.

### 6.2 UX Characteristics

1. Side-panel controls with live visual preview.
2. Immediate state-driven updates to poster.
3. Mobile-friendly sidebar toggle and overlay behavior.
4. Modal for expanded output presets.

---

## 7. Functional Requirements

### 7.1 Location and Geocoding

1. Provide location search with autocomplete-like results via Nominatim.
2. Show and update latitude/longitude fields.
3. Allow direct coordinate edits.
4. Display formatted coordinates on poster.
5. Support city title override independent from geocoder result.

### 7.2 Rendering Modes

1. **Standard mode (Leaflet):**
   - Use raster tile providers.
   - Support labels on/off where available.
2. **Artistic mode (Mapbox GL JS):**
   - Use vector source and generated custom styles.
   - Support multiple predefined artistic palettes.

### 7.3 Theme and Styling Controls

1. Standard theme select (minimal, dark, voyager, satellite, etc.).
2. Artistic theme select from color palette catalog.
3. Typography controls for title font family.
4. Overlay controls:
   - Size: none/small/medium/large.
   - Background effect: none/vignette.
5. Dynamic accent color tied to active theme context.

### 7.4 Output and Export

1. Preset dimensions by category:
   - Social media
   - Wallpaper
   - Paper/poster
2. Custom width/height input.
3. Export to PNG at target dimensions.
4. Preserve visual fidelity of map + text + overlay in exported image.
5. Show loading/processing states during export.

### 7.5 State Management and Persistence

1. Maintain a centralized client-side state object.
2. Update UI and preview reactively from state subscriptions.
3. Persist selected settings to localStorage across sessions.

### 7.6 Responsiveness and Interaction

1. Support desktop and mobile layouts.
2. Provide mobile sidebar toggle and backdrop.
3. Keep preview scaled to available viewport area.
4. Sync map interaction updates between rendering engines.

---

## 8. Non-Functional Requirements

### 8.1 Performance

1. UI interactions should feel near real-time for control updates.
2. Map movement and zoom updates should stay smooth on modern browsers.
3. Export should complete reliably for defined preset resolutions.

### 8.2 Reliability

1. Graceful handling for geocoder aborts/errors.
2. Fallback handling for invalid color values/utilities.
3. Timeout-based safety for tile/artistic idle waits.

### 8.3 Privacy and Security

1. No user account required.
2. Settings stored locally in browser localStorage.
3. Rendering performed client-side; only external map/geocoder APIs are requested.

### 8.4 Accessibility (Current and Desired)

1. Keyboard and focus behavior should be maintained for all controls.
2. Visual contrast should remain acceptable across themes.
3. Future improvement: explicit accessibility audit and WCAG remediation pass.

---

## 9. System and Technical Architecture

### 9.1 Frontend Stack

1. Vanilla JavaScript modules.
2. Vite bundler/build tool.
3. Tailwind CSS + custom CSS layers.
4. Leaflet for raster map rendering.
5. Mapbox GL JS for artistic vector rendering.
6. html2canvas for composition export.

### 9.2 Module Responsibilities

1. `main.js`: App bootstrap, subscriptions, export flow.
2. `src/core/state.js`: Global state and local persistence.
3. `src/ui/form.js`: Control wiring and preview style updates.
4. `src/map/map-init.js`: Map initialization, sync, style switching.
5. `src/core/export.js`: Snapshot composition and PNG download.
6. `src/core/themes.js` + `src/core/artistic-themes.js`: Theme definitions.

### 9.3 Deployment

1. Static build output via Vite.
2. Docker multi-stage build.
3. Nginx serves compiled SPA assets with `index.html` fallback routing.

---

## 10. External Dependencies and Integrations

1. **Nominatim API** for place search.
2. **Tile providers** (OSM/Carto/Esri/OpenFreeMap).
3. **Hosted font files** for download links.

Operational consideration: service availability and request limits of third-party providers can affect user experience.

---

## 11. Success Metrics

### 11.1 Product Metrics

1. Export success rate.
2. Time-to-first-export.
3. Distribution of selected output presets.
4. Percentage of sessions using artistic mode.
5. Repeat usage rate (returning sessions with saved settings present).

### 11.2 Quality Metrics

1. Export mismatch/visual defect rate (manual QA or issue reports).
2. Geocoder error rate.
3. Crash/uncaught exception rate in client console telemetry (if instrumented).

---

## 12. Risks and Mitigations

1. **Third-party map/geocoder reliability**
   - Mitigation: error handling, retries where safe, provider abstraction.
2. **Export quality variance across browsers**
   - Mitigation: tested export pipeline, explicit clone styling, font readiness waits.
3. **Large-size export memory pressure**
   - Mitigation: resolution guidance, optimized capture flow, future progressive export options.
4. **Licensing/compliance for map tiles and fonts**
   - Mitigation: maintain attribution/license review for providers and font assets.

---

## 13. Roadmap (Recommended)

### Phase 1: Quality and Hardening

1. Add automated regression checks for core flows.
2. Add explicit error UI for geocoder and export failures.
3. Improve accessibility and keyboard navigation coverage.

### Phase 2: Output Expansion

1. Add PDF and optional transparent-background PNG export variants.
2. Add print-safe guides and bleed margins.
3. Add watermark/logo toggle.

### Phase 3: Advanced Customization

1. Add custom color palette editor for artistic themes.
2. Add text layout controls (line breaks, spacing presets, alignment variants).
3. Add optional decorative layers (frames, compass marks, grid overlays).

---

## 14. Acceptance Criteria (Current Version)

1. User can search and select location and see map update.
2. User can switch between standard and artistic rendering modes.
3. User can change theme, zoom, typography, and overlay options.
4. User can choose preset/custom dimensions and see scaled preview.
5. User can export a PNG reflecting visible poster design.
6. User settings persist after page reload.
