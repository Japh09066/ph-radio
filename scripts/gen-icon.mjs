import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <circle cx="256" cy="276" r="78" fill="none" stroke="#ffffff" stroke-width="26"/>
  <circle cx="256" cy="276" r="22" fill="#ffffff"/>
  <path d="M322 142 L388 96" stroke="#ffffff" stroke-width="26" stroke-linecap="round"/>
  <text x="256" y="452" font-family="Arial, sans-serif" font-size="70" font-weight="bold" fill="#ffffff" text-anchor="middle">PH</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/icon-512.png");
console.log("created public/icon-512.png");
