# Interactive Video CAPTCHA for meldCX Coding Test

For the meldCX coding test, I created a video CAPTCHA verification system. It uses the user’s camera to take a live photo. A moving square overlays the screen to make the challenge more dynamic. After capturing the photo, it displays a 4x4 grid filled with random shapes and colors inside the square. The user must select all sections that match the target shape and color, such as all red triangles. The app provides real-time feedback with clear highlights and smooth transitions. It’s designed to be easy for humans to use while being difficult for bots by combining camera input and visual recognition.

---

## Features

- Built an interactive CAPTCHA that uses the user’s camera to capture a live photo.  
- Overlays a moving square to create a dynamic visual challenge.  
- Displays a 4×4 grid of random shapes and colors inside the square after capture.  
- Users select all sectors that match a target shape and color (for example, all red triangles).  
- Provides real-time visual feedback with clear highlights and smooth transitions.  
- Designed to be easy for humans but difficult for bots by combining camera input and visual recognition.  
- Developed with React 19, TypeScript, and Vite for a modern, fast setup.  
- Styled using Tailwind CSS.  
- Ensured code quality with Vitest, React Testing Library, and ESLint.  

---

## Project Structure

```
src/
  components/
    CameraPreview.tsx     # Camera preview component
    CaptureCanvas.tsx     # Canvas for image capture
    SelectionGrid.tsx     # Interactive shape selection grid
  pages/
    CaptchaVerification.tsx # Main CAPTCHA flow
  utils/
    verificationHelpers.ts  # Verification helper functions
  __tests__/
    ShapeGrid.test.tsx      # Example test
```

---

## Quick Start

### Prerequisites
- Node.js v16+  
- npm v8+  

### Install & Run

```bash
git clone https://github.com/nazmultanvir/medlcx_coding_test
cd medlcx_coding_text
npm install
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173)

### Run Tests
```bash
npm run test
```

---

## How It Works

1. Camera Stage – Allow camera access, see a moving square overlay on your video.  
2. Capture – Hit "Continue" to take a snapshot with the square's position frozen.  
3. Shape Selection – Inside the square, find and select all sectors matching a given shape/color (for example, "red triangles").  
4. Validation – Your selection is checked. You have up to 3 tries.  
5. Result – Pass or retry.  

---

## ShapeGrid Details

- 4×4 grid with random shapes, colors, rotation, and jitter.  
- Click to toggle selection with instant visual feedback.  
- Fully modular – easily change shapes, colors, or grid size.  

---

## Configuration Files

- `vite.config.ts` – Vite setup + absolute imports  
- `tailwind.config.js` – Tailwind with custom colors  
- `postcss.config.js` – Tailwind PostCSS plugin  
- `tsconfig.json` – TypeScript config + path aliases  
- `eslint.config.js` – ESLint rules for TS & React  

---

  

## Potential Improvements

- **Accessibility:** Improve keyboard navigation, add ARIA labels, and make screen reader compatibility better for all interactive parts.
- **Mobile Optimization:** Tailor the UI and camera experience more effectively for smartphones and tablets.
- **Customization:** Allow users to set grid size, shape types, and colors to change difficulty levels.
- **Security:** Add extra anti-bot features like time limits, behavioral checks, and server-side verification.
- **Localization:** Include multi-language support and right-to-left layout handling for broader accessibility.
- **Performance:** Use lazy-loading for camera and grid elements and optimize rendering on less powerful devices.
- **Analytics:** Optionally track completion stats and common failure points while respecting user privacy.
- **Alternative Inputs:** Look into support for touch gestures or voice commands to improve accessibility.
- **Analytics & Logging:** Add optional analytics to track completion rates and common failure points while keeping privacy in mind.
- **Alternative Input:** Investigate support for touch gestures or voice commands to enhance accessibility.


## Limitations
- Didn’t have much time to fully develop and polish the CAPTCHA.
- Couldn’t thoroughly test across multiple browsers and devices.
- Mobile camera experience isn’t fully optimized yet.
- Accessibility features like keyboard navigation and screen reader support are limited.
- No advanced anti-bot measures like behavior analysis or server-side validation implemented.

---
