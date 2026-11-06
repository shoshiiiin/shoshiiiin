# Figuren mit OpenAI erzeugen

Fünf Bilder, jedes als PNG mit **transparentem Hintergrund**. Speichern unter:

| Datei | Wofür | Format |
|---|---|---|
| `art/itachi.png` | Hero, links vor dem Mond | Hochformat 2:3, 1024 × 1536 |
| `art/sasuke.png` | Hero, rechts, Chidori-Hand | Hochformat 2:3, 1024 × 1536 |
| `art/team7.png` | Morgengrauen, vor der Sonne | Querformat 3:2, 1536 × 1024 |
| `art/itachi-susanoo.png` | Hero, schwebt hinter Itachi | Hochformat 2:3, 1024 × 1536 |
| `art/sasuke-susanoo.png` | Hero, schwebt hinter Sasuke | Hochformat 2:3, 1024 × 1536 |

Danach:

```bash
python3 -I scripts/prepare-art.py && npm run build
```

Das Skript schneidet den leeren Rand weg, verkleinert und speichert WebP mit Transparenz
in `src/art/`. Die Ankerpunkte (Augen, Chidori-Hand) stehen in `art/anchors.json` und
werden einmal pro Bild gesetzt.

Hinweise:
- Lehnt das Modell die Namen ab, die Namen streichen; die Beschreibung trägt die Figur.
- Ist der Hintergrund nicht transparent: „make the background transparent“ nachschieben,
  über die API `background: "transparent"` setzen.
- Blitze, Flammen, Krähen, Mond und Susanoo **nicht** ins Bild: die zeichnet und bewegt
  der Generator selbst, sonst stehen sie doppelt.

## Gemeinsamer Stil (an jeden Prompt anhängen)

```text
Style: cinematic dark anime key art, cel-shaded with clean ink lines, low-key lighting.
About 85% of the figure sits in deep shadow, almost black (#05040a), read mainly by its
silhouette; only a thin, sharp rim light traces the edges. Palette limited to near-black,
crimson (#e0182d, #ff5468) and deep ultraviolet (#a66bff, #120c24). Mystical, quiet,
menacing. Full body from the top of the hair to the soles of the feet, centred, with a
small empty margin on every side. Transparent background (PNG with alpha). No ground, no
floor shadow, no moon, no sky, no scenery, no text, no logos, no watermark, no frame.
```

## 1 · Itachi (`art/itachi.png`, 1024 × 1536)

```text
Itachi Uchiha from Naruto Shippuden, standing calm and completely still, front view,
turned slightly towards the right edge of the image. Long black Akatsuki cloak with the
high stiff collar raised to his nose, red clouds with thin white outlines on the cloak,
the cloak reaching his ankles, its hem lifted slightly by wind. Long straight black hair,
centre-parted bangs framing his face, low ponytail, forehead protector with a scratch
through the symbol. His right hand rests inside the front opening of the cloak, the left
sleeve hangs empty. His eyes glow red with the three-tomoe Sharingan, the brightest points
of the whole figure. Light: a blood-red full moon behind him to the right throws a thin
crimson rim light along the right edge of his hair, collar, shoulder and cloak; everything
else is deep shadow. No crows, no ravens, no Susanoo, no weapons.
```

## 2 · Sasuke (`art/sasuke.png`, 1024 × 1536)

```text
Sasuke Uchiha from Naruto Shippuden in his Taka outfit, standing in a ready stance,
three-quarter view facing the left edge of the image. Spiky black hair, long bangs over
the left side of his face. Open light-grey high-collared shirt, thick purple rope belt tied
in a large bow at his back, dark navy cloth wrapped around his waist to the knees, dark
trousers, ninja sandals. His right hand holds the Kusanagi, a thin straight sword, blade
angled down and back towards the lower right. His left arm reaches forward and down
towards the left of the image, palm open, fingers spread, hand empty, as if about to
gather lightning. Do not draw any lightning, it is added later. Eyes: his right eye shows
the red Mangekyō Sharingan, his left eye the purple Rinnegan with tomoe; both glow softly.
Light: a cold violet-blue rim light from below left, where the lightning will be, traces
his left arm, face and left side; a thin crimson rim light from above left. Everything
else deep shadow. No lightning, no flames, no Susanoo.
```

## 3 · Team 7 im Morgengrauen (`art/team7.png`, 1536 × 1024)

Hier gilt der gemeinsame Stil **nicht** (Gegenlicht in Gold statt Rot):

```text
Three young ninja from Naruto seen from behind, standing side by side, looking at a
sunrise in front of them. Left: Naruto Uzumaki, spiky blond hair, orange and black jacket,
his right fist raised to the sky. Middle: Sakura Haruno, shoulder-length pink hair, red
top. Right: Sasuke Uchiha, spiky black hair, dark high-collared shirt, hands relaxed.
Strong backlight from a golden sunrise in front of them: their bodies are dark
silhouettes, a warm golden-orange rim light (#ffd27a, #ff9a3c) glows along every outer
edge and through the hair, with only a hint of each character's colours in the shadows.
Mood: hopeful and quiet, after a long night. Style: cinematic anime key art, cel-shaded,
clean lines. Full figures from head to feet, feet touching the bottom edge, a small margin
on the other sides. Transparent background (PNG with alpha). No sun, no sky, no hill, no
scenery, no text, no logos, no watermark.
```

## 4 · Itachis Susanoo (`art/itachi-susanoo.png`, 1024 × 1536)

Am echtesten wird es mit Vorlage: einen Screenshot des Susanoo aus dem Anime hochladen und
dazuschreiben „Recreate exactly this Susanoo in the same anime style, isolated, transparent
background, nobody in front of it.“ Ohne Vorlage diesen Prompt nehmen:

```text
Itachi Uchiha's Susanoo exactly as it appears in the Naruto Shippuden anime, alone, nobody in front of it. Style: a frame from the TV anime, cel-shaded with crisp edges and flat layers of colour; not airbrushed, not foggy, not painterly, not a ghost. A giant made of orange-red chakra (#ff5a2a to #ff9a3c): inside, a visible skeleton (skull, ribcage, arm bones); around it layered armour plates of flame-like chakra whose edges flicker like fire. Head: a stern humanoid demon face with a long straight nose, narrow glowing eyes and a closed mouth, under a hood-like headpiece with two short upward points. Not a bird, no beak, no plague-doctor mask. Right hand: the Totsuka Sword, a long thin wavy blade of liquid light flowing out of a gourd. Left arm: the Yata Mirror, a large round shield with a three-tomoe swirl. Front view, centred, upper body only, no legs, the chakra thinning out towards the bottom. Head about 12% from the top edge, the figure about 80% of the width. Transparent background (PNG with alpha), the glow fading into transparency; no black background, no sky, no ground, no text, no logos, no watermark. Portrait 2:3, 1024 x 1536.
```

## 5 · Sasukes Susanoo (`art/sasuke-susanoo.png`, 1024 × 1536)

Auch hier ist ein Anime-Screenshot als Vorlage der sicherste Weg. Ohne Vorlage:

```text
Sasuke Uchiha's Susanoo exactly as it appears in the Naruto Shippuden anime, alone, nobody in front of it. Style: a frame from the TV anime, cel-shaded with crisp edges and flat layers of colour; not airbrushed, not foggy, not painterly, not a ghost. A giant made of purple chakra (#8a4dff to #c7a6ff) with a cold blue-white core (#7fd6ff): inside, a visible skeleton (skull, ribcage, arm bones); around it samurai-like armour of flame-like chakra, with a helmet, broad shoulder plates and a chest plate, the edges flickering like fire. Head: a fierce armoured demon face with glowing eyes and a jagged mouth guard, long horns curving up from the helmet. Not a bird, no beak, no owl. It holds a huge bow of purple chakra with an arrow of crackling lightning nocked and aimed to the left of the image. Front view, centred, upper body only, no legs, the chakra thinning out towards the bottom. Head about 12% from the top edge, the figure about 80% of the width. Transparent background (PNG with alpha), the glow fading into transparency; no black background, no sky, no ground, no text, no logos, no watermark. Portrait 2:3, 1024 x 1536.
```
