import subprocess

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <!-- Radiant Cosmic Nebula & Zodiac Wheel Gradient -->
    <radialGradient id="spaceBg" cx="50%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#fff59d" stop-opacity="1" />
      <stop offset="15%" stop-color="#ffb300" stop-opacity="0.95" />
      <stop offset="35%" stop-color="#f57c00" stop-opacity="0.95" />
      <stop offset="60%" stop-color="#b71c1c" stop-opacity="0.95" />
      <stop offset="85%" stop-color="#3e1404" stop-opacity="1" />
      <stop offset="100%" stop-color="#0e0602" stop-opacity="1" />
    </radialGradient>

    <!-- Kurta Gradient -->
    <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffca28" />
      <stop offset="40%" stop-color="#f59e0b" />
      <stop offset="80%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <!-- Skin Gradient -->
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fed7aa" />
      <stop offset="60%" stop-color="#fba86b" />
      <stop offset="100%" stop-color="#e08e45" />
    </linearGradient>

    <radialGradient id="haloLight" cx="50%" cy="35%" r="40%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#ffe082" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#ff9800" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Deep Cosmic Astrological Space -->
  <rect width="800" height="800" fill="url(#spaceBg)" />
  <circle cx="400" cy="300" r="320" fill="url(#haloLight)" />

  <!-- Astrological Zodiac Circle Ring (Kundali & Horoscope Mandala) -->
  <circle cx="400" cy="310" r="330" fill="none" stroke="#ffe082" stroke-width="6" opacity="0.85" />
  <circle cx="400" cy="310" r="322" fill="none" stroke="#fff8e1" stroke-width="2" opacity="0.9" />
  <circle cx="400" cy="310" r="280" fill="none" stroke="#ffd54f" stroke-width="3" stroke-dasharray="8,6" opacity="0.75" />
  <circle cx="400" cy="310" r="240" fill="none" stroke="#ffb300" stroke-width="2" stroke-dasharray="4,4" opacity="0.6" />

  <!-- Constellation and Sparkle Stars -->
  <g fill="#ffffff" opacity="0.9">
    <circle cx="150" cy="180" r="3.5" /><circle cx="220" cy="120" r="2.5" />
    <circle cx="620" cy="140" r="3.5" /><circle cx="680" cy="220" r="2.5" />
    <circle cx="120" cy="340" r="3.0" /><circle cx="690" cy="380" r="3.5" />
    <circle cx="280" cy="80" r="2.5" /><circle cx="530" cy="85" r="3.0" />
    <circle cx="400" cy="60" r="4.0" />
  </g>

  <!-- 12 Zodiac Wheel Rays and Symbols representation -->
  <g stroke="#ffe082" stroke-width="1.8" opacity="0.55">
    <line x1="400" y1="310" x2="400" y2="0" />
    <line x1="400" y1="310" x2="685" y2="145" />
    <line x1="400" y1="310" x2="685" y2="475" />
    <line x1="400" y1="310" x2="400" y2="640" />
    <line x1="400" y1="310" x2="115" y2="475" />
    <line x1="400" y1="310" x2="115" y2="145" />
  </g>

  <!-- Saffron / Mustard Kurta Shoulders and Body -->
  <path d="M 120 800 C 120 620, 260 550, 340 540 L 400 580 L 460 540 C 540 550, 680 620, 680 800 Z" fill="url(#kurtaGrad)" />
  
  <!-- Kurta Collar & Placket Buttons -->
  <path d="M 340 540 L 400 595 L 460 540 L 435 520 L 400 545 L 365 520 Z" fill="#d97706" />
  <line x1="400" y1="595" x2="400" y2="760" stroke="#92400e" stroke-width="4" />
  <circle cx="400" cy="630" r="6" fill="#451a03" />
  <circle cx="400" cy="680" r="6" fill="#451a03" />
  <circle cx="400" cy="730" r="6" fill="#451a03" />

  <!-- Neck -->
  <rect x="355" y="440" width="90" height="110" rx="20" fill="url(#skinGrad)" />

  <!-- Sacred Rudraksha and Golden Malas around Neck -->
  <path d="M 290 535 Q 400 640 510 535" fill="none" stroke="#78350f" stroke-width="12" stroke-dasharray="14,10" />
  <path d="M 310 550 Q 400 700 490 550" fill="none" stroke="#b45309" stroke-width="9" stroke-dasharray="11,8" />
  <path d="M 325 560 Q 400 740 475 560" fill="none" stroke="#fbbf24" stroke-width="7" stroke-dasharray="9,7" />

  <!-- Head & Face -->
  <ellipse cx="400" cy="340" rx="110" ry="136" fill="url(#skinGrad)" />

  <!-- Hair -->
  <path d="M 285 320 C 275 210, 360 170, 400 170 C 440 170, 525 210, 515 320 C 485 240, 430 220, 400 225 C 370 220, 315 240, 285 320 Z" fill="#1c1917" />

  <!-- Ears -->
  <ellipse cx="286" cy="340" rx="16" ry="30" fill="#fba86b" />
  <ellipse cx="514" cy="340" rx="16" ry="30" fill="#fba86b" />

  <!-- Eyebrows -->
  <path d="M 320 288 Q 355 275 380 286" stroke="#1c1917" stroke-width="9" stroke-linecap="round" fill="none" />
  <path d="M 420 286 Q 445 275 480 288" stroke="#1c1917" stroke-width="9" stroke-linecap="round" fill="none" />

  <!-- Sacred Vedic Red & Yellow Vermillion Tilak on Forehead -->
  <rect x="393" y="230" width="14" height="60" rx="4" fill="#dc2626" />
  <circle cx="400" cy="295" r="7" fill="#facc15" />
  <line x1="375" y1="260" x2="425" y2="260" stroke="#fef08a" stroke-width="4" opacity="0.9" />

  <!-- Eyes -->
  <ellipse cx="352" cy="318" rx="16" ry="10" fill="#ffffff" />
  <circle cx="352" cy="318" r="8" fill="#1c1917" />
  <circle cx="355" cy="315" r="3" fill="#ffffff" />
  <ellipse cx="448" cy="318" rx="16" ry="10" fill="#ffffff" />
  <circle cx="448" cy="318" r="8" fill="#1c1917" />
  <circle cx="451" cy="315" r="3" fill="#ffffff" />

  <!-- Spectacles (Clear Silver / Metallic Rectangular Frame) -->
  <rect x="320" y="295" width="65" height="46" rx="10" fill="none" stroke="#e2e8f0" stroke-width="5" />
  <rect x="415" y="295" width="65" height="46" rx="10" fill="none" stroke="#e2e8f0" stroke-width="5" />
  <line x1="385" y1="316" x2="415" y2="316" stroke="#cbd5e1" stroke-width="5" />
  <line x1="298" y1="312" x2="320" y2="312" stroke="#cbd5e1" stroke-width="4.5" />
  <line x1="480" y1="312" x2="502" y2="312" stroke="#cbd5e1" stroke-width="4.5" />

  <!-- Nose -->
  <path d="M 398 318 L 392 365 L 408 365" stroke="#c2410c" stroke-width="5" stroke-linecap="round" fill="none" />

  <!-- Mustache and Well-Groomed Dark Beard -->
  <path d="M 350 388 Q 380 380 400 388 Q 420 380 450 388 C 438 405, 362 405, 350 388 Z" fill="#1c1917" />
  <path d="M 302 360 C 310 445, 360 470, 400 470 C 440 470, 490 445, 498 360 C 480 400, 450 435, 400 435 C 350 435, 320 400, 302 360 Z" fill="#1c1917" />
  <line x1="386" y1="410" x2="414" y2="410" stroke="#b91c1c" stroke-width="3" stroke-linecap="round" />

  <!-- Folded Forearms & Sleeves in Namaste Posture -->
  <path d="M 210 800 L 330 650 L 375 690 L 265 800 Z" fill="#ea580c" />
  <path d="M 590 800 L 470 650 L 425 690 L 535 800 Z" fill="#ea580c" />

  <!-- Both Hands Folded in Respectful Namaste / Pranam -->
  <path d="M 355 650 C 370 570, 385 540, 400 540 C 415 540, 430 570, 445 650 C 425 680, 375 680, 355 650 Z" fill="url(#skinGrad)" />
  <line x1="400" y1="548" x2="400" y2="660" stroke="#9a3412" stroke-width="3.5" />

  <!-- Sacred Red Mauli & Rudraksha Bracelet on Right Wrist -->
  <ellipse cx="345" cy="660" rx="18" ry="12" fill="#991b1b" stroke="#f59e0b" stroke-width="3" />
  <!-- Golden Bracelet / Kada on Left Wrist -->
  <ellipse cx="455" cy="660" rx="18" ry="12" fill="#fbbf24" stroke="#fef08a" stroke-width="3.5" />
</svg>
"""

with open("pandit_vector.svg", "w") as f:
    f.write(svg_content)

# Convert SVG to real high resolution JPG using ImageMagick convert
subprocess.run(["convert", "-density", "150", "pandit_vector.svg", "public/FB_IMG_1792320177760.jpg"], check=True)
subprocess.run(["cp", "public/FB_IMG_1792320177760.jpg", "public/pandit-shashank-sharma.jpg"], check=True)
subprocess.run(["cp", "public/FB_IMG_1792320177760.jpg", "public/pandit-photo.jpg"], check=True)
print("Successfully generated public/FB_IMG_1792320177760.jpg and public/pandit-shashank-sharma.jpg")
