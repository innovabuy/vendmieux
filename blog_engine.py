"""
VendMieux Blog Auto-Publisher Engine
Reproduit le système cap-numerik en Python pour vendmieux.fr
- Génération d'articles via Claude API
- Optimisation SEO automatique
- Génération d'images OG (Pillow)
- Sitemap XML
- Maillage interne
"""

import json
import os
import re
import math
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Optional

import httpx
from PIL import Image, ImageDraw, ImageFont

# ═══════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════

BLOG_DIR = Path(__file__).parent / "blog"
DATA_DIR = BLOG_DIR / "data"
ARTICLES_DIR = DATA_DIR / "articles"
IMAGES_DIR = BLOG_DIR / "images" / "og"
INDEX_FILE = DATA_DIR / "articles-index.json"
TOPICS_FILE = DATA_DIR / "topics.json"
BASE_URL = "https://vendmieux.fr"
SITE_NAME = "VendMieux"
AUTHOR = "Jean-François Perrin"

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929"
ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages"

# Fonts for OG images
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

# Categories for VendMieux blog
CATEGORIES = {
    "prospection": {
        "name": "Prospection & Prise de RDV",
        "color": {"dark": [8, 80, 100], "mid": [6, 182, 212], "light": [34, 211, 238]},
        "code": "prosp",
        "icon": "PR",
        "keywords": ["prospection", "cold calling", "prise de rendez-vous", "téléprospection", "phoning"],
    },
    "negociation": {
        "name": "Négociation & Closing",
        "color": {"dark": [58, 32, 120], "mid": [139, 92, 246], "light": [167, 139, 250]},
        "code": "nego",
        "icon": "NG",
        "keywords": ["négociation", "closing", "prix", "remise", "concession"],
    },
    "objections": {
        "name": "Traitement des Objections",
        "color": {"dark": [10, 80, 42], "mid": [34, 197, 94], "light": [74, 222, 128]},
        "code": "obj",
        "icon": "OB",
        "keywords": ["objection", "réponse", "argumentation", "réfutation"],
    },
    "methode": {
        "name": "Méthodes & Techniques de Vente",
        "color": {"dark": [100, 65, 5], "mid": [245, 158, 11], "light": [251, 191, 36]},
        "code": "meth",
        "icon": "MT",
        "keywords": ["méthode", "FORCE 3D", "SPIN", "technique de vente", "processus commercial"],
    },
    "formation": {
        "name": "Formation & Coaching Commercial",
        "color": {"dark": [100, 20, 38], "mid": [244, 63, 94], "light": [251, 113, 133]},
        "code": "form",
        "icon": "FC",
        "keywords": ["formation", "coaching", "simulateur", "IA", "entraînement"],
    },
}

# Cross-site links vers Cap Performances
CROSS_LINKS = [
    {"url": "https://www.cap-performances.fr/consulting.php", "anchor": "structurer votre stratégie commerciale", "kw": ["stratégie commerciale", "pipeline", "forecast", "plan commercial"]},
    {"url": "https://www.cap-performances.fr/formations.php", "anchor": "formation management commercial", "kw": ["management", "équipe commerciale", "coaching", "onboarding"]},
    {"url": "https://www.cap-performances.fr/methode.php", "anchor": "méthode FORCE 3D", "kw": ["méthode commerciale", "FORCE 3D", "force de vente"]},
    {"url": "https://audit.cap-performances.fr", "anchor": "diagnostic commercial gratuit", "kw": ["audit commercial", "diagnostic", "maturité commerciale"]},
]


# ═══════════════════════════════════════════════════════════════
# HELPERS SEO
# ═══════════════════════════════════════════════════════════════

def normalize_seo(text: str) -> str:
    """Normalize text for SEO matching: lowercase, remove accents, normalize hyphens."""
    text = text.lower()
    text = text.replace("-", " ").replace("–", " ").replace("—", " ").replace("_", " ")
    nfkd = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in nfkd if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", text).strip()


def french_stem(word: str) -> str:
    """Simplified French stemming — extract word root."""
    if len(word) < 4:
        return word
    suffixes = [
        "isation", "issement", "ement", "ation", "ition",
        "ment", "ence", "ance", "iste", "isme",
        "ient", "ent", "ant", "ion", "eur", "eux", "ise",
        "ees", "ers", "es", "ee", "er", "ez", "ir",
        "is", "it", "ie", "ai", "e", "s",
    ]
    for suffix in suffixes:
        if len(word) > len(suffix) + 3 and word.endswith(suffix):
            return word[: len(word) - len(suffix)]
    return word


def slugify(text: str) -> str:
    text = normalize_seo(text)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text.strip())
    text = re.sub(r"-+", "-", text)
    return text[:80]


def count_keyword(text: str, keyword: str) -> int:
    """Count keyword occurrences with 3-level French matching (like cap-numerik)."""
    nt = normalize_seo(text)
    nk = normalize_seo(keyword)
    if not nk:
        return 0

    # Level 1: exact normalized match
    exact = nt.count(nk)
    if exact > 0:
        return exact

    # Level 2: stem-based multi-word matching
    kw_parts = nk.split()
    if len(kw_parts) > 1:
        kw_stems = [french_stem(p) for p in kw_parts]
        pattern = r"[\s\-]+".join(re.escape(s) for s in kw_stems) + r"[a-z]*"
        matches = re.findall(pattern, nt)
        if matches:
            return len(matches)

    # Level 3: single word — match by stem
    kw_stem = french_stem(nk)
    if len(kw_stem) < 3:
        return 0
    words = re.split(r"[\s\W]+", nt)
    count = 0
    for w in words:
        if not w:
            continue
        w_stem = french_stem(w)
        if w_stem == kw_stem:
            count += 1
        elif len(kw_stem) >= 4 and (w_stem.startswith(kw_stem) or kw_stem.startswith(w_stem)):
            count += 1
    return count


def to_plain(md: str) -> str:
    plain = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", md)
    plain = re.sub(r"[#*!`>_~]", "", plain)
    return re.sub(r"\s+", " ", plain).strip()


def word_count(text: str) -> int:
    return len([w for w in text.split() if len(w) > 0])


def estimate_read_time(md: str) -> int:
    wc = word_count(to_plain(md))
    return max(3, min(15, math.ceil(wc / 220)))


# ═══════════════════════════════════════════════════════════════
# DATA LAYER
# ═══════════════════════════════════════════════════════════════

def _ensure_dirs():
    ARTICLES_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def load_index() -> list:
    if INDEX_FILE.exists():
        return json.loads(INDEX_FILE.read_text(encoding="utf-8"))
    return []


def save_index(articles: list):
    _ensure_dirs()
    INDEX_FILE.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def load_topics() -> list:
    if TOPICS_FILE.exists():
        return json.loads(TOPICS_FILE.read_text(encoding="utf-8"))
    return []


def save_topics(topics: list):
    _ensure_dirs()
    TOPICS_FILE.write_text(
        json.dumps(topics, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def get_published() -> list:
    return [a for a in load_index() if a.get("status") == "published"]


# ═══════════════════════════════════════════════════════════════
# ANTHROPIC API
# ═══════════════════════════════════════════════════════════════

def call_anthropic(prompt: str, max_tokens: int = 4000) -> str:
    resp = httpx.post(
        ANTHROPIC_ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        json={
            "model": ANTHROPIC_MODEL,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["content"][0]["text"]


# ═══════════════════════════════════════════════════════════════
# OG IMAGE GENERATOR
# ═══════════════════════════════════════════════════════════════

def generate_og_image(title: str, category: str, slug: str) -> str:
    _ensure_dirs()
    cat = CATEGORIES.get(category, list(CATEGORIES.values())[0])
    c = cat["color"]

    w, h = 1200, 630
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)

    # Dark gradient with category tint
    for y in range(h):
        f = y / h
        r = int(c["dark"][0] + (c["mid"][0] - c["dark"][0]) * f * 0.4)
        g = int(c["dark"][1] + (c["mid"][1] - c["dark"][1]) * f * 0.4)
        b = int(c["dark"][2] + (c["mid"][2] - c["dark"][2]) * f * 0.4)
        draw.line([(0, y), (w, y)], fill=(max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))))

    # Accent bars
    acc = tuple(c["light"])
    draw.rectangle([0, 0, 5, h], fill=acc)
    draw.rectangle([0, h - 3, w, h], fill=acc)

    # Diagonal accents
    acc_fade = tuple(c["light"]) + (40,)
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    for i in range(8):
        x = w - 300 + (i * 40)
        overlay_draw.line([(x, 0), (x + 200, h)], fill=acc_fade, width=1)
    img.paste(Image.alpha_composite(Image.new("RGBA", (w, h), (0, 0, 0, 0)), overlay).convert("RGB"), mask=overlay.split()[3])

    try:
        font_bold = ImageFont.truetype(FONT_BOLD, 34)
        font_reg = ImageFont.truetype(FONT_REGULAR, 13)
        font_mono = ImageFont.truetype(FONT_MONO, 11)
        font_logo = ImageFont.truetype(FONT_BOLD, 44)
    except OSError:
        font_bold = ImageFont.load_default()
        font_reg = font_bold
        font_mono = font_bold
        font_logo = font_bold

    white = (255, 255, 255)
    gray = (148, 163, 184)

    # Category badge with background (like cap-numerik)
    cat_label = cat["name"].upper()
    try:
        bbox_cat = font_mono.getbbox(cat_label)
        cat_w = bbox_cat[2] - bbox_cat[0] + 20
    except Exception:
        cat_w = len(cat_label) * 8 + 20
    # Semi-transparent badge background
    badge_overlay = Image.new("RGBA", (cat_w, 26), tuple(c["light"]) + (40,))
    badge_bg = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    badge_bg.paste(badge_overlay, (44, 68))
    img.paste(Image.alpha_composite(Image.new("RGBA", (w, h), (0, 0, 0, 0)), badge_bg).convert("RGB"), mask=badge_bg.split()[3])
    draw = ImageDraw.Draw(img)  # Refresh draw after paste
    draw.text((54, 72), cat_label, fill=acc, font=font_mono)

    # Title (word-wrapped)
    lines = _wrap_text(title, font_bold, w - 140)
    y_start = 140
    for i, line in enumerate(lines[:4]):
        draw.text((48, y_start + i * 50), line, fill=white, font=font_bold)

    # Bottom
    draw.text((48, h - 36), "vendmieux.fr", fill=gray, font=font_reg)
    months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
    date_label = f"Blog · {months[datetime.now().month - 1]} {datetime.now().year}"
    draw.text((w - 180, h - 36), date_label, fill=(100, 116, 139), font=font_mono)

    # Logo
    draw.text((w - 130, 45), "VM", fill=acc, font=font_logo)

    filepath = IMAGES_DIR / f"{slug}.png"
    img.save(str(filepath), "PNG", optimize=True)
    return f"/blog/images/og/{slug}.png"


def _wrap_text(text: str, font, max_w: int) -> list:
    words = text.split()
    lines, cur = [], ""
    for word in words:
        test = f"{cur} {word}" if cur else word
        bbox = font.getbbox(test)
        tw = bbox[2] - bbox[0]
        if tw > max_w and cur:
            lines.append(cur)
            cur = word
        else:
            cur = test
    if cur:
        lines.append(cur)
    return lines[:4]


# ═══════════════════════════════════════════════════════════════
# ARTICLE GENERATOR
# ═══════════════════════════════════════════════════════════════

def generate_article(
    title: str,
    keyword: str,
    category: str = "",
    tags: list = None,
    slug: str = "",
    internal_links: list = None,
    angle: str = "",
    meta_description: str = "",
) -> dict:
    """Generate a single article with SEO optimization."""
    if not slug:
        slug = slugify(title)
    if tags is None:
        tags = []
    if internal_links is None:
        internal_links = []

    published = get_published()

    # Build internal links context
    links_ctx = ""
    for ls in internal_links:
        found = next((a for a in published if a["slug"] == ls), None)
        if found:
            links_ctx += f'- Article : [{found["title"]}](/blog/{ls})\n'
        else:
            links_ctx += f"- Article : /blog/{ls}\n"

    # Cross-site links
    article_ctx = normalize_seo(f"{title} {keyword} {' '.join(tags)}")
    cross_ctx = ""
    relevant_cross = []
    for theme in CROSS_LINKS:
        for kw in theme["kw"]:
            if normalize_seo(kw) in article_ctx:
                relevant_cross.append(theme)
                break
    if relevant_cross:
        cross_ctx = "\n**Liens vers Cap Performances (marque sœur — conseil & formation commerciale B2B) :**\n"
        cross_ctx += "Intègre 1 à 2 liens max, uniquement si le contexte s'y prête naturellement :\n"
        for t in relevant_cross[:2]:
            cross_ctx += f'- [{t["anchor"]}]({t["url"]})\n'

    # Other articles
    other_ctx = ""
    for a in published:
        other_ctx += f'- "{a["title"]}" → /blog/{a["slug"]} ({a.get("category", "")})\n'
    if not other_ctx:
        other_ctx = "(aucun article publié)\n"

    tags_str = ", ".join(tags)

    prompt = f"""Tu es un rédacteur SEO expert en formation commerciale B2B pour vendmieux.fr (simulateur d'entraînement commercial par IA, coaching vente, prospection téléphonique, traitement des objections, négociation B2B, méthode FORCE 3D).

Rédige un article complet en Markdown :

**Titre** : {title}
**Mot-clé principal** : {keyword}
**Catégorie** : {category}
**Tags** : {tags_str}
"""
    if angle:
        prompt += f"\n**Angle éditorial** : {angle}\n"

    prompt += f"""
**Liens internes obligatoires** :
{links_ctx}
- OBLIGATOIRE — page simulateur : [Essayer le simulateur VendMieux](https://vendmieux.fr/demo)
- OBLIGATOIRE — page d'accueil : [Découvrir VendMieux](https://vendmieux.fr)
{cross_ctx}

**Autres articles du blog** :
{other_ctx}

**Règles strictes** :

STRUCTURE :
- PAS de H1 (géré par template)
- Introduction directe et accrocheuse, pas de "Dans cet article..."
- Minimum 4 H2 (##), avec H3 si nécessaire
- Conclusion avec CTA vers le simulateur VendMieux

SEO :
- "{keyword}" dans les 100 premiers mots
- Densité 1-2.5%, variantes sémantiques réparties
- Pas de keyword stuffing

CONTENU :
- Ton pro, direct, pragmatique — zéro bullshit
- Ciblé dirigeants PME, responsables commerciaux, responsables formation
- Exemples concrets, chiffres, ROI
- 1200-1500 mots
- Pas de "dans un monde en constante évolution" ni formules creuses
- Mentionner le simulateur VendMieux comme outil d'entraînement quand c'est pertinent

MAILLAGE :
- Liens internes fournis intégrés naturellement
- Lien vers le simulateur mentionné 2 fois (intro + conclusion)
- Liens Cap Performances si pertinents (max 2)

FORMAT : Markdown pur, **gras** pour termes clés, listes à puces. Pas d'images.

UNIQUEMENT le Markdown, rien d'autre."""

    content = call_anthropic(prompt, 4000)
    content = content.strip()
    content = re.sub(r"^```(?:markdown)?\s*", "", content)
    content = re.sub(r"\s*```$", "", content)

    # ─── SEO AUTO-OPTIMIZE ───
    fixes = []

    # Fix H1 → H2
    if re.search(r"^# [^\n]+", content, re.MULTILINE):
        content = re.sub(r"^# ([^\n]+)", r"## \1", content, flags=re.MULTILINE)
        fixes.append("H1 convertis en H2")

    # Analyze
    plain = to_plain(content)
    wc = word_count(plain)
    kw_count = count_keyword(plain, keyword)
    density = round(kw_count / wc * 100, 1) if wc > 0 else 0

    # Check keyword in intro
    first_100 = " ".join(plain.split()[:100])
    if not count_keyword(first_100, keyword):
        lines = content.split("\n")
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped and not stripped.startswith("#") and not stripped.startswith("-") and not stripped.startswith("!"):
                lines[i] += f" La question de **{keyword}** est centrale pour les équipes commerciales B2B."
                fixes.append("Mot-clé injecté dans l'introduction")
                break
        content = "\n".join(lines)

    # Auto-generate meta
    opt_meta = meta_description
    if not opt_meta or len(opt_meta) < 80:
        for line in content.split("\n"):
            stripped = line.strip()
            if stripped and not stripped.startswith("#") and not stripped.startswith("-"):
                clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", stripped)
                clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", clean)
                opt_meta = clean[:155]
                sp = opt_meta.rfind(" ")
                if sp > 100:
                    opt_meta = opt_meta[:sp]
                opt_meta = opt_meta.rstrip(" .,;:—–-") + "."
                fixes.append("Meta description auto-générée")
                break

    # Generate OG image
    og_url = ""
    try:
        og_url = generate_og_image(title, category, slug)
    except Exception as e:
        fixes.append(f"Image OG : {e}")

    # Final stats
    final_plain = to_plain(content)
    f_wc = word_count(final_plain)
    f_kw = count_keyword(final_plain, keyword)
    f_density = round(f_kw / f_wc * 100, 1) if f_wc > 0 else 0
    h2_count = len(re.findall(r"^## ", content, re.MULTILINE))
    int_links = len(re.findall(r"\[.+?\]\(/.+?\)", content))

    return {
        "ok": True,
        "content": content,
        "meta_description": opt_meta,
        "slug": slug,
        "og_image": og_url,
        "seo_report": {
            "word_count": f_wc,
            "keyword": keyword,
            "keyword_count": f_kw,
            "keyword_density": f"{f_density}%",
            "h2_count": h2_count,
            "internal_links": int_links,
            "fixes_applied": fixes,
        },
    }


# ═══════════════════════════════════════════════════════════════
# BATCH GENERATOR
# ═══════════════════════════════════════════════════════════════

def generate_batch(count: int = 3, category_filter: str = "") -> dict:
    """Generate multiple articles from the topics queue."""
    _ensure_dirs()

    topics = load_topics()
    articles = load_index()
    existing_slugs = {a["slug"] for a in articles}

    # Filter pending topics
    pending = [t for t in topics if t.get("status") != "published" and t["slug"] not in existing_slugs]
    if category_filter:
        pending = [t for t in pending if t.get("category") == category_filter]

    to_generate = pending[:count]
    if not to_generate:
        return {"ok": False, "error": "Aucun sujet en attente", "generated": 0}

    results = []
    generated = 0
    errors = 0

    for topic in to_generate:
        slug = topic["slug"]
        title = topic["title"]

        try:
            response = generate_article(
                title=title,
                keyword=topic.get("keyword", title),
                category=topic.get("category", ""),
                tags=topic.get("tags", []),
                slug=slug,
                internal_links=topic.get("internal_links", []),
                angle=topic.get("angle", ""),
                meta_description=topic.get("meta_description", ""),
            )

            if not response.get("ok"):
                errors += 1
                results.append({"slug": slug, "status": "error", "error": response.get("error", "Unknown")})
                continue

            # Save markdown
            md_file = ARTICLES_DIR / f"{slug}.md"
            md_file.write_text(response["content"], encoding="utf-8")

            # Add to index
            articles.append({
                "slug": slug,
                "title": title,
                "meta_description": response["meta_description"],
                "category": topic.get("category", ""),
                "tags": topic.get("tags", []),
                "date": datetime.now().strftime("%Y-%m-%d"),
                "read_time": str(estimate_read_time(response["content"])),
                "file": f"{slug}.md",
                "status": "published",
            })

            # Mark topic as published
            for t in topics:
                if t["slug"] == slug:
                    t["status"] = "published"
                    break

            save_index(articles)
            save_topics(topics)
            generated += 1
            results.append({"slug": slug, "status": "ok", "seo_report": response["seo_report"]})

        except Exception as e:
            errors += 1
            results.append({"slug": slug, "status": "error", "error": str(e)})

    # Regenerate sitemaps
    if generated > 0:
        generate_sitemaps()

    return {"ok": True, "generated": generated, "errors": errors, "total": len(to_generate), "results": results}


# ═══════════════════════════════════════════════════════════════
# SITEMAP GENERATOR
# ═══════════════════════════════════════════════════════════════

def generate_sitemaps():
    root = BLOG_DIR.parent
    articles = get_published()
    now = datetime.now().strftime("%Y-%m-%d")

    static_pages = [
        {"path": "/", "changefreq": "weekly", "priority": "1.0"},
        {"path": "/demo", "changefreq": "weekly", "priority": "0.9"},
        {"path": "/blog/", "changefreq": "daily", "priority": "0.8"},
    ]

    # sitemap-blog.xml
    blog_xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    blog_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for a in articles:
        slug = a["slug"]
        lastmod = a.get("date", now)
        blog_xml += f"  <url>\n    <loc>{BASE_URL}/blog/{slug}</loc>\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n"
    blog_xml += "</urlset>\n"
    (root / "sitemap-blog.xml").write_text(blog_xml, encoding="utf-8")

    # sitemap.xml
    main_xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    main_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for p in static_pages:
        main_xml += f'  <url>\n    <loc>{BASE_URL}{p["path"]}</loc>\n    <changefreq>{p["changefreq"]}</changefreq>\n    <priority>{p["priority"]}</priority>\n  </url>\n'
    for a in articles:
        slug = a["slug"]
        lastmod = a.get("date", now)
        main_xml += f"  <url>\n    <loc>{BASE_URL}/blog/{slug}</loc>\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n"
    main_xml += "</urlset>\n"
    (root / "sitemap.xml").write_text(main_xml, encoding="utf-8")

    # robots.txt
    robots = f"""User-agent: *
Allow: /

Sitemap: {BASE_URL}/sitemap.xml

Disallow: /api/
"""
    (root / "robots.txt").write_text(robots, encoding="utf-8")


# ═══════════════════════════════════════════════════════════════
# SEO OPTIMIZER (15 checks like cap-numerik)
# ═══════════════════════════════════════════════════════════════

SEO_WEIGHTS = {
    "title_length": 8, "title_keyword": 7, "meta_length": 7, "meta_keyword": 5,
    "no_h1": 6, "h2_count": 6, "h2_keyword": 5, "word_count": 10,
    "keyword_density": 8, "keyword_intro": 7, "keyword_conclusion": 5,
    "internal_links": 8, "cross_site": 4, "og_image": 4,
}


def optimize_seo(
    title: str, slug: str, meta: str, keyword: str, content: str,
    category: str = "", tags: list = None, fix: str = None,
) -> dict:
    """15-point SEO check with optional auto-fix (like cap-numerik optimize-seo.php)."""
    if tags is None:
        tags = []

    opt_title = title
    opt_meta = meta
    opt_content = content
    checks = []

    kw_lower = normalize_seo(keyword) if keyword else ""

    def should_fix(check_id: str) -> bool:
        return fix == "all" or fix == check_id

    # ── 1. TITLE LENGTH ──
    tl = len(opt_title)
    t_ok = 30 <= tl <= 60
    t_warn = (60 < tl <= 70) or (20 <= tl < 30)
    t_score = 100 if t_ok else (60 if t_warn else (30 if tl > 0 else 0))
    fixed_title = None
    if not t_ok and tl > 60 and should_fix("title_length"):
        cut = opt_title[:60]
        sp = cut.rfind(" ")
        if sp > 35:
            cut = cut[:sp]
        fixed_title = cut.rstrip(" :,;—–-")
        opt_title = fixed_title
    checks.append({"id": "title_length", "status": "ok" if t_ok else ("warning" if t_warn else "error"), "score": t_score, "current": f"{tl} caractères", "fix_applied": fixed_title is not None})

    # ── 2. KEYWORD IN TITLE ──
    kw_in_title = bool(kw_lower and count_keyword(opt_title, keyword))
    kw_at_start = kw_lower and normalize_seo(opt_title).startswith(kw_lower)
    kw_t_score = 100 if kw_at_start else (80 if kw_in_title else 0)
    checks.append({"id": "title_keyword", "status": "ok" if kw_in_title else "error", "score": kw_t_score, "current": "Présent" if kw_in_title else "Absent", "fix_applied": False})

    # ── 3. META LENGTH ──
    ml = len(opt_meta)
    m_ok = 120 <= ml <= 160
    m_warn = (80 <= ml < 120) or (160 < ml <= 200)
    m_score = 100 if m_ok else (50 if m_warn else (20 if ml > 0 else 0))
    fixed_meta = None
    if not m_ok and should_fix("meta_length"):
        if ml < 80:
            for line in opt_content.split("\n"):
                l = line.strip()
                if l and not l.startswith("#") and not l.startswith("-"):
                    clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", l)
                    clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", clean)
                    fixed_meta = clean[:155]
                    sp = fixed_meta.rfind(" ")
                    if sp > 100:
                        fixed_meta = fixed_meta[:sp]
                    fixed_meta = fixed_meta.rstrip(" .,;:—–-") + "."
                    opt_meta = fixed_meta
                    break
        elif ml > 160:
            fixed_meta = opt_meta[:155]
            sp = fixed_meta.rfind(" ")
            if sp > 100:
                fixed_meta = fixed_meta[:sp]
            fixed_meta = fixed_meta.rstrip(" .,;:—–-") + "."
            opt_meta = fixed_meta
    checks.append({"id": "meta_length", "status": "ok" if m_ok else ("warning" if m_warn else "error"), "score": m_score, "current": f"{ml} caractères", "fix_applied": fixed_meta is not None})

    # ── 4. KEYWORD IN META ──
    kw_in_meta = bool(kw_lower and count_keyword(opt_meta, keyword))
    checks.append({"id": "meta_keyword", "status": "ok" if kw_in_meta else "warning", "score": 100 if kw_in_meta else 0, "current": "Présent" if kw_in_meta else "Absent", "fix_applied": False})

    # ── 5. NO H1 ──
    h1_count = len(re.findall(r"^# [^\n]+", opt_content, re.MULTILINE))
    h1_fixed = False
    if h1_count > 0 and should_fix("no_h1"):
        opt_content = re.sub(r"^# ([^\n]+)", r"## \1", opt_content, flags=re.MULTILINE)
        h1_fixed = True
    checks.append({"id": "no_h1", "status": "ok" if h1_count == 0 else "error", "score": 100 if h1_count == 0 else 0, "current": f"{h1_count} H1", "fix_applied": h1_fixed})

    # ── 6. H2 COUNT ──
    h2_matches = re.findall(r"^## [^\n]+", opt_content, re.MULTILINE)
    h2_count = len(h2_matches)
    h2_ok = 3 <= h2_count <= 8
    checks.append({"id": "h2_count", "status": "ok" if h2_ok else "warning", "score": 100 if h2_ok else (50 if h2_count >= 1 else 0), "current": f"{h2_count} H2", "fix_applied": False})

    # ── 7. KEYWORD IN H2 ──
    kw_in_h2 = sum(1 for h2 in h2_matches if count_keyword(h2, keyword)) if kw_lower else 0
    checks.append({"id": "h2_keyword", "status": "ok" if 1 <= kw_in_h2 <= 3 else "warning", "score": 100 if 1 <= kw_in_h2 <= 3 else 0, "current": f"{kw_in_h2} H2 avec mot-clé", "fix_applied": False})

    # ── 8. WORD COUNT ──
    plain = to_plain(opt_content)
    wc = word_count(plain)
    wc_ok = wc >= 1200
    checks.append({"id": "word_count", "status": "ok" if wc_ok else ("warning" if wc >= 800 else "error"), "score": 100 if wc_ok else (60 if wc >= 800 else 0), "current": f"{wc} mots", "fix_applied": False})

    # ── 9. KEYWORD DENSITY ──
    kw_count = count_keyword(plain, keyword) if kw_lower else 0
    density = round(kw_count / wc * 100, 1) if wc > 0 else 0
    d_ok = 1 <= density <= 2.5
    d_warn = (0.5 <= density < 1) or (2.5 < density <= 3.5)
    dens_fixed = False
    if kw_lower and density < 0.8 and wc > 300 and should_fix("keyword_density"):
        target_add = max(1, math.ceil(wc * 0.015) - kw_count)
        lines = opt_content.split("\n")
        added = 0
        for i in range(len(lines) - 1, -1, -1):
            if added >= target_add:
                break
            if lines[i].strip().startswith("## ") and not count_keyword(lines[i], keyword):
                for j in range(i + 1, len(lines)):
                    if added >= target_add:
                        break
                    pl = lines[j].strip()
                    if pl and not pl.startswith("#") and not pl.startswith("-") and not pl.startswith("!"):
                        if not count_keyword(lines[j], keyword):
                            lines[j] = re.sub(r"\.\s", f". En matière de **{keyword}**, ", lines[j], count=1)
                            added += 1
                        break
        if added > 0:
            opt_content = "\n".join(lines)
            dens_fixed = True
    checks.append({"id": "keyword_density", "status": "ok" if d_ok else ("warning" if d_warn else "error"), "score": 100 if d_ok else (50 if d_warn else 0), "current": f"{density}% ({kw_count} occ.)", "fix_applied": dens_fixed})

    # ── 10. KEYWORD IN INTRO ──
    words_list = plain.split()
    first_100 = " ".join(words_list[:100])
    kw_intro = bool(kw_lower and count_keyword(first_100, keyword))
    intro_fixed = False
    if kw_lower and not kw_intro and should_fix("keyword_intro"):
        lines = opt_content.split("\n")
        for i in range(min(len(lines), 20)):
            l = lines[i].strip()
            if l and not l.startswith("#") and not l.startswith("-") and not l.startswith("!") and not l.startswith("["):
                lines[i] += f" La question de **{keyword}** est centrale pour les équipes commerciales B2B."
                intro_fixed = True
                break
        if intro_fixed:
            opt_content = "\n".join(lines)
    checks.append({"id": "keyword_intro", "status": "ok" if kw_intro else "error", "score": 100 if kw_intro else 0, "current": "Présent" if kw_intro else "Absent", "fix_applied": intro_fixed})

    # ── 11. KEYWORD IN CONCLUSION ──
    last_100 = " ".join(words_list[-100:])
    kw_concl = bool(kw_lower and count_keyword(last_100, keyword))
    checks.append({"id": "keyword_conclusion", "status": "ok" if kw_concl else "warning", "score": 100 if kw_concl else 0, "current": "Présent" if kw_concl else "Absent", "fix_applied": False})

    # ── 12. INTERNAL LINKS ──
    int_links = re.findall(r"\[.+?\]\(/.+?\)", opt_content)
    il_count = len(int_links)
    checks.append({"id": "internal_links", "status": "ok" if il_count >= 3 else ("warning" if il_count >= 1 else "error"), "score": 100 if il_count >= 3 else (50 if il_count >= 1 else 0), "current": f"{il_count} lien(s)", "fix_applied": False})

    # ── 13. CROSS-SITE CAP PERFORMANCES ──
    has_cross = bool(re.search(r"cap-performances\.fr", opt_content))
    checks.append({"id": "cross_site", "status": "ok" if has_cross else "warning", "score": 100 if has_cross else 30, "current": "Présent" if has_cross else "Absent", "fix_applied": False})

    # ── 14. OG IMAGE ──
    og_file = IMAGES_DIR / f"{slug}.png"
    has_og = slug and og_file.exists()
    checks.append({"id": "og_image", "status": "ok" if has_og else "warning", "score": 100 if has_og else 0, "current": "Présente" if has_og else "Absente", "fix_applied": False})

    # ── GLOBAL SCORE ──
    total_weight = sum(SEO_WEIGHTS.values())
    weighted = sum((c["score"] / 100) * SEO_WEIGHTS.get(c["id"], 5) for c in checks)
    global_score = round(weighted / total_weight * 100)

    ok_count = sum(1 for c in checks if c["status"] == "ok")
    warn_count = sum(1 for c in checks if c["status"] == "warning")
    err_count = sum(1 for c in checks if c["status"] == "error")
    fix_count = sum(1 for c in checks if c["fix_applied"])

    return {
        "ok": True,
        "global_score": global_score,
        "checks": checks,
        "optimized": {"title": opt_title, "meta_description": opt_meta, "content": opt_content},
        "summary": f"{ok_count} OK, {warn_count} alerte(s), {err_count} erreur(s)" + (f" — {fix_count} fix appliqué(s)" if fix_count else ""),
    }


# ═══════════════════════════════════════════════════════════════
# MARKDOWN → HTML CONVERTER
# ═══════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# ARTICLES CRUD (for admin)
# ═══════════════════════════════════════════════════════════════

def save_article(data: dict) -> dict:
    """Create or update an article. Returns {'ok': True, 'article': {...}}"""
    _ensure_dirs()
    slug = slugify(data.get("slug", "") or data.get("title", ""))
    if not slug or not data.get("title"):
        return {"ok": False, "error": "title and slug required"}

    articles = load_index()
    content = data.get("content", "")
    wc = word_count(to_plain(content))
    rt = max(1, round(wc / 200))

    # Detect category
    cat_name = data.get("category", "")
    cat_id = ""
    for cid, cinfo in CATEGORIES.items():
        if cinfo["name"] == cat_name:
            cat_id = cid
            break

    article = {
        "slug": slug,
        "title": data["title"],
        "meta_description": data.get("meta_description", ""),
        "category": cat_name,
        "tags": data.get("tags", []),
        "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
        "read_time": str(rt),
        "file": f"{slug}.md",
        "status": data.get("status", "draft"),
    }

    # Save markdown
    md_path = ARTICLES_DIR / f"{slug}.md"
    md_path.write_text(content, encoding="utf-8")

    # Update index
    existing_idx = next((i for i, a in enumerate(articles) if a["slug"] == slug), None)
    if existing_idx is not None:
        articles[existing_idx] = article
    else:
        articles.insert(0, article)

    save_index(articles)
    generate_sitemaps()

    # Bidirectional link management (only for published articles)
    if article.get("status") == "published":
        ensure_bidirectional_links(slug)

    # Invalidate editorial suggestions cache
    cache_file = DATA_DIR / "editorial-suggestions.json"
    if cache_file.exists():
        cache_file.unlink()

    return {"ok": True, "article": article}


def delete_article(slug: str) -> dict:
    """Delete an article by slug."""
    articles = load_index()
    found = False
    for i, a in enumerate(articles):
        if a["slug"] == slug:
            md_file = ARTICLES_DIR / a.get("file", f"{slug}.md")
            if md_file.exists():
                md_file.unlink()
            og_file = IMAGES_DIR / f"{slug}.png"
            if og_file.exists():
                og_file.unlink()
            articles.pop(i)
            found = True
            break

    if not found:
        return {"ok": False, "error": "Not found"}

    save_index(articles)
    generate_sitemaps()

    cache_file = DATA_DIR / "editorial-suggestions.json"
    if cache_file.exists():
        cache_file.unlink()

    return {"ok": True}


def get_article(slug: str) -> dict | None:
    """Get a single article with its content."""
    articles = load_index()
    article = next((a for a in articles if a["slug"] == slug), None)
    if not article:
        return None
    md_file = ARTICLES_DIR / article.get("file", f"{slug}.md")
    article["content"] = md_file.read_text(encoding="utf-8") if md_file.exists() else ""
    return article


# ═══════════════════════════════════════════════════════════════
# SUGGEST TOPICS (AI editorial planning)
# ═══════════════════════════════════════════════════════════════

CATEGORY_TARGETS = {
    "prospection": 12, "negociation": 8, "objections": 7,
    "methode": 9, "formation": 9,
}

def suggest_topics(force_refresh: bool = False) -> dict:
    """Suggest next 5 articles to write, with caching."""
    cache_file = DATA_DIR / "editorial-suggestions.json"

    # Return cache if fresh (< 24h) and not forced
    if not force_refresh and cache_file.exists():
        cache_age = (datetime.now().timestamp() - cache_file.stat().st_mtime)
        if cache_age < 86400:
            cached = json.loads(cache_file.read_text(encoding="utf-8"))
            if cached and cached.get("suggestions"):
                cached["from_cache"] = True
                cached["cache_age"] = int(cache_age)
                return cached

    # Build island status
    published = get_published()
    all_articles = load_index()

    island_status = []
    for cat_id, cat_info in CATEGORIES.items():
        cat_articles = [a for a in published if a.get("category") == cat_info["name"]]
        existing = [{"title": a["title"], "slug": a["slug"]} for a in cat_articles]
        target = CATEGORY_TARGETS.get(cat_id, 5)
        island_status.append({
            "id": cat_id,
            "name": cat_info["name"],
            "keywords": cat_info["keywords"],
            "target": target,
            "current": len(existing),
            "delta": target - len(existing),
            "articles": existing,
        })

    island_status.sort(key=lambda x: x["delta"], reverse=True)

    # Build prompt
    island_ctx = ""
    for isl in island_status:
        island_ctx += f"\n### Catégorie : {isl['name']} (id: {isl['id']})\n"
        island_ctx += f"- Articles existants : {isl['current']}/{isl['target']} (manque {isl['delta']})\n"
        island_ctx += f"- Mots-clés : {', '.join(isl['keywords'])}\n"
        if isl["articles"]:
            island_ctx += "- Titres existants :\n"
            for art in isl["articles"]:
                island_ctx += f'  - "{art["title"]}" (slug: {art["slug"]})\n'
        else:
            island_ctx += "- Aucun article encore\n"

    all_list = ""
    for a in published:
        all_list += f'- "{a["title"]}" | slug: {a["slug"]} | cat: {a.get("category", "?")}\n'
    if not all_list:
        all_list = "(aucun article publié)\n"

    prompt = f"""Tu es un stratège SEO pour vendmieux.fr (simulateur d'entraînement commercial IA, méthode FORCE 3D, formation vente B2B).

État actuel des catégories :
{island_ctx}

Articles existants :
{all_list}

Propose exactement 5 articles à rédiger en priorité.

Critères :
1. Catégories les plus sous-alimentées en premier
2. Sujets à fort potentiel de trafic (commerciaux B2B, directeurs commerciaux, formateurs)
3. Pas de doublon
4. Maillage interne possible avec les articles existants
5. Varier les formats : guide, comparatif, étude de cas, checklist

Réponds UNIQUEMENT en JSON :
{{
  "suggestions": [
    {{
      "title": "< 60 caractères",
      "slug": "slug-seo",
      "meta_description": "120-155 caractères",
      "keyword": "mot-clé principal",
      "category": "nom exact de catégorie",
      "tags": ["tag1", "tag2"],
      "priority": "haute|moyenne",
      "rationale": "2 lignes max",
      "internal_links": ["/blog/slug-1", "/blog/slug-2"]
    }}
  ]
}}"""

    try:
        content = call_anthropic(prompt, max_tokens=2000)
        content = content.strip()
        content = re.sub(r"^```json\s*", "", content)
        content = re.sub(r"\s*```$", "", content)
        suggestions = json.loads(content)
    except Exception as e:
        return {"ok": False, "error": f"AI error: {str(e)}"}

    if not suggestions or "suggestions" not in suggestions:
        return {"ok": False, "error": "Invalid AI response"}

    result = {
        "ok": True,
        "islands": island_status,
        "suggestions": suggestions["suggestions"],
        "generated_at": datetime.now().isoformat(),
        "from_cache": False,
    }

    cache_file.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


# ═══════════════════════════════════════════════════════════════
# MAILLAGE GRAPH (link network for admin)
# ═══════════════════════════════════════════════════════════════

CAT_COLORS = {
    "prospection": "#22d3ee",
    "negociation": "#a78bfa",
    "objections": "#4ade80",
    "methode": "#fbbf24",
    "formation": "#fb7185",
}

def _cat_id_from_name(cat_name: str) -> str:
    for cid, cinfo in CATEGORIES.items():
        if cinfo["name"] == cat_name:
            return cid
    return ""


def maillage_graph() -> dict:
    """Build nodes + edges for force-directed graph."""
    articles = load_index()

    # Nodes — internal pages
    pages = [
        {"id": "page-demo", "label": "/demo", "type": "pillar", "island": "formation", "color": CAT_COLORS.get("formation", "#94a3b8")},
    ]

    nodes = list(pages)

    for art in articles:
        slug = art.get("slug", "")
        cat_id = _cat_id_from_name(art.get("category", ""))
        nodes.append({
            "id": f"art-{slug}",
            "slug": slug,
            "label": art.get("title", "")[:40] + ("…" if len(art.get("title", "")) > 40 else ""),
            "full_title": art.get("title", ""),
            "type": "article",
            "island": cat_id,
            "color": CAT_COLORS.get(cat_id, "#94a3b8"),
            "status": art.get("status", "draft"),
        })

    # Edges
    edges = []
    for art in articles:
        slug = art.get("slug", "")
        md_file = ARTICLES_DIR / art.get("file", f"{slug}.md")
        if not md_file.exists():
            continue
        content = md_file.read_text(encoding="utf-8")

        # Blog internal links
        for m in re.finditer(r"\[([^\]]+)\]\(/blog/([a-z0-9\-]+)\)", content):
            edges.append({"source": f"art-{slug}", "target": f"art-{m.group(2)}", "type": "internal"})

        # Links to /demo
        if "/demo" in content:
            edges.append({"source": f"art-{slug}", "target": "page-demo", "type": "pillar"})

        # Cross-site links
        if re.search(r"cap-performances\.fr", content):
            edges.append({"source": f"art-{slug}", "target": "ext-cap-performances", "type": "cross-site"})

    # Cap Performances external node
    has_cross = any(e["type"] == "cross-site" for e in edges)
    if has_cross:
        nodes.append({"id": "ext-cap-performances", "label": "cap-performances.fr", "type": "external", "island": "", "color": "#fbbf24"})

    # Orphans
    target_ids = set(e["target"] for e in edges)
    for n in nodes:
        if n["type"] in ("article",) and n["id"] not in target_ids:
            n["orphan"] = True

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "orphans": sum(1 for n in nodes if n.get("orphan")),
        },
    }


# ═══════════════════════════════════════════════════════════════
# SEO SCORER (for dashboard table)
# ═══════════════════════════════════════════════════════════════

def calculate_seo_score(article: dict) -> dict:
    """Calculate SEO score for dashboard table display."""
    slug = article.get("slug", "")
    md_file = ARTICLES_DIR / article.get("file", f"{slug}.md")
    content = md_file.read_text(encoding="utf-8") if md_file.exists() else ""

    wc = word_count(to_plain(content))
    title = article.get("title", "")
    meta = article.get("meta_description", "")

    # Count links
    internal_links = len(re.findall(r"\[.+?\]\(/.+?\)", content))
    cross_links = len(re.findall(r"\[.+?\]\(https?://.*?cap-performances\.fr[^)]*\)", content))

    # Incoming links
    all_articles = load_index()
    incoming = 0
    for a in all_articles:
        if a["slug"] == slug:
            continue
        other_file = ARTICLES_DIR / a.get("file", f"{a['slug']}.md")
        if other_file.exists():
            other_content = other_file.read_text(encoding="utf-8")
            if f"/blog/{slug}" in other_content:
                incoming += 1

    # Score (simplified 0-100)
    score = 0
    if 30 <= len(title) <= 60: score += 12
    elif title: score += 6
    if 120 <= len(meta) <= 160: score += 12
    elif meta: score += 6
    h2_count = len(re.findall(r"^## ", content, re.MULTILINE))
    if h2_count >= 3: score += 10
    elif h2_count >= 1: score += 5
    if wc >= 1000: score += 15
    elif wc >= 500: score += 8
    if internal_links >= 3: score += 15
    elif internal_links >= 1: score += 8
    if incoming >= 1: score += 12
    if cross_links >= 1: score += 8
    # Keyword density
    kw = normalize_seo(title.split(":")[0].split("—")[0].strip()) if title else ""
    if kw and content:
        kw_count = count_keyword(content, kw)
        density = kw_count / max(1, wc) * 100
        if 1 <= density <= 3: score += 8
        elif 0.5 <= density <= 4: score += 4
    # OG image
    if (IMAGES_DIR / f"{slug}.png").exists(): score += 8

    return {
        "seo_score": min(100, score),
        "word_count": wc,
        "outgoing_links": internal_links,
        "incoming_links": incoming,
        "cross_site_links": cross_links,
    }


# ═══════════════════════════════════════════════════════════════
# GENERATE SINGLE ARTICLE (for admin editor)
# ═══════════════════════════════════════════════════════════════

def generate_single_article(data: dict) -> dict:
    """Generate a single article from admin editor (title, keyword, category, etc.)
    Returns {ok, content, meta_description, slug, og_image, seo_report}"""
    title = data.get("title", "")
    keyword = data.get("keyword", "")
    category = data.get("category", "")
    tags = data.get("tags", [])
    slug = data.get("slug", "") or slugify(title)
    meta = data.get("meta_description", "")
    internal_links = data.get("internal_links", [])

    if not title:
        return {"ok": False, "error": "title required"}

    # Build cross links
    cross_link_md = ""
    for cl in CROSS_LINKS:
        for kw in cl["kw"]:
            if normalize_seo(kw) in normalize_seo(title + " " + keyword + " " + " ".join(tags)):
                cross_link_md = f'[{cl["anchor"]}]({cl["url"]})'
                break
        if cross_link_md:
            break

    # Internal links instructions
    links_md = ""
    if internal_links:
        if isinstance(internal_links[0], dict):
            links_md = "\n".join(f'- [{l.get("anchor", l.get("url", ""))}]({l.get("url", "")})' for l in internal_links)
        else:
            links_md = "\n".join(f"- {l}" for l in internal_links)

    prompt = f"""Tu es un rédacteur expert en vente B2B pour le blog vendmieux.fr (simulateur commercial IA).

Rédige un article de blog de 1200-1500 mots en Markdown.

Titre (H1 géré par le template, NE PAS inclure de #) : {title}
Mot-clé principal : {keyword or title}
Catégorie : {category}
Tags : {', '.join(tags)}

Contraintes SEO :
- Commence par ## Introduction avec le mot-clé dans les 100 premiers mots
- 5-8 H2 structurants, mot-clé dans 2-3 H2
- Densité mot-clé : 1-2.5%
- Termine par ## Conclusion avec CTA vers [simulateur VendMieux](https://vendmieux.fr/demo)

Liens internes à intégrer naturellement :
{links_md or "Aucun lien interne imposé"}

{f'Lien cross-site à placer : {cross_link_md}' if cross_link_md else ''}

Lien CTA final : [Découvrir VendMieux](https://vendmieux.fr)

Style : professionnel, concret, orienté action. Pas de jargon marketing vide. Des exemples pratiques."""

    try:
        content = call_anthropic(prompt, max_tokens=4000)
    except Exception as e:
        return {"ok": False, "error": str(e)}

    # Auto-fix H1
    content = re.sub(r"^# (.+)$", r"## \1", content, flags=re.MULTILINE)

    # Auto meta
    if not meta:
        first_p = re.search(r"(?:^|\n)(?!#)(.{50,200}?)(?:\n|$)", content)
        if first_p:
            meta = first_p.group(1).strip()[:155]

    # Generate OG image
    og_image = ""
    try:
        og_image = generate_og_image(title, category, slug)
    except Exception:
        pass

    # SEO report
    wc = word_count(to_plain(content))
    kw_count = count_keyword(content, keyword or title)
    density = kw_count / max(1, wc) * 100
    h2s = len(re.findall(r"^## ", content, re.MULTILINE))
    int_links = len(re.findall(r"\[.+?\]\(/.+?\)", content))
    cross = 1 if re.search(r"cap-performances\.fr", content) else 0

    return {
        "ok": True,
        "content": content,
        "meta_description": meta,
        "slug": slug,
        "og_image": og_image,
        "seo_report": {
            "word_count": wc,
            "keyword_density": f"{density:.1f}%",
            "h2_count": h2s,
            "internal_links": int_links,
            "cross_site_links": cross,
        },
    }


# ═══════════════════════════════════════════════════════════════
# RELATED ARTICLES (smart scoring like cap-numerik)
# ═══════════════════════════════════════════════════════════════

def get_related_articles(current_slug: str, category: str, tags: list = None, limit: int = 3) -> list:
    """Find related articles using smart scoring.
    Same category: +10, common tags: +3 each, cross-category with common tags: +2, recency bonus.
    """
    if tags is None:
        tags = []

    articles = load_index()
    published = [a for a in articles if a.get("status") == "published" and a.get("slug") != current_slug]

    if not published:
        return []

    normalized_tags = [t.lower() for t in tags]
    scored = []

    for a in published:
        score = 0

        # Same category = +10
        if a.get("category", "") == category:
            score += 10

        # Common tags = +3 each
        a_tags = [t.lower() for t in (a.get("tags") or [])]
        common = len(set(normalized_tags) & set(a_tags))
        score += common * 3

        # Cross-category bonus (inter-category linking) — less than same but useful
        if a.get("category", "") != category and common > 0:
            score += 2

        # Recency bonus (newer articles slightly preferred)
        date_str = a.get("date", "2020-01-01")
        try:
            article_date = datetime.fromisoformat(date_str)
            age_days = (datetime.now() - article_date).days
            if age_days < 30:
                score += 2
            elif age_days < 90:
                score += 1
        except (ValueError, TypeError):
            pass

        if score > 0:
            scored.append({"article": a, "score": score})

    # Sort by score descending
    scored.sort(key=lambda x: x["score"], reverse=True)

    return [s["article"] for s in scored[:limit]]


# ═══════════════════════════════════════════════════════════════
# BIDIRECTIONAL LINK MANAGEMENT (maillage like cap-numerik)
# ═══════════════════════════════════════════════════════════════

def _build_link_matrix(articles: list) -> dict:
    """Build a matrix of outgoing /blog/ links for each article slug."""
    slugs = {a.get("slug", "") for a in articles}
    matrix = {}

    for art in articles:
        slug = art.get("slug", "")
        md_file = ARTICLES_DIR / art.get("file", f"{slug}.md")
        if not md_file.exists():
            matrix[slug] = []
            continue

        content = md_file.read_text(encoding="utf-8")
        matches = re.findall(r"\[.+?\]\(/blog/([a-z0-9\-]+)\)", content)
        targets = list(set(m for m in matches if m in slugs and m != slug))
        matrix[slug] = targets

    return matrix


def ensure_bidirectional_links(slug: str) -> int:
    """Ensure reciprocal links exist for a given article.
    If article B links to A, but A doesn't link back to B,
    adds a 'À lire également' section with the missing links.
    Returns number of links added.
    """
    articles = load_index()
    published = [a for a in articles if a.get("status") == "published"]
    matrix = _build_link_matrix(published)

    # Build title lookup
    titles = {a["slug"]: a.get("title", a["slug"]) for a in published}

    if slug not in matrix:
        return 0

    current_outlinks = matrix[slug]
    missing_reciprocal = []

    for other_slug, other_targets in matrix.items():
        if other_slug == slug:
            continue
        # Does other_slug link to slug?
        if slug in other_targets:
            # Does slug link back to other_slug?
            if other_slug not in current_outlinks:
                missing_reciprocal.append(other_slug)

    if not missing_reciprocal:
        return 0

    md_file = ARTICLES_DIR / f"{slug}.md"
    if not md_file.exists():
        return 0

    content = md_file.read_text(encoding="utf-8")

    has_read_more = bool(re.search(r"^## À lire également", content, re.MULTILINE))

    # Limit to 5 links max to stay natural
    links_to_add = missing_reciprocal[:5]

    if has_read_more:
        added = 0
        for target_slug in links_to_add:
            if f"/blog/{target_slug}" in content:
                continue
            title = titles.get(target_slug, target_slug)
            link_line = f"- [{title}](/blog/{target_slug})"
            content = content.rstrip() + "\n" + link_line + "\n"
            added += 1
        if added == 0:
            return 0
    else:
        block = "\n\n## À lire également\n"
        actual_added = 0
        for target_slug in links_to_add:
            if f"/blog/{target_slug}" in content:
                continue
            title = titles.get(target_slug, target_slug)
            block += f"\n- [{title}](/blog/{target_slug})"
            actual_added += 1
        if actual_added == 0:
            return 0
        content = content.rstrip() + block + "\n"

    md_file.write_text(content, encoding="utf-8")
    return len(links_to_add)


def rebuild_all_links() -> dict:
    """Rebuild all bidirectional links for all published articles.
    Returns a report: {slug: nb_links_added}.
    """
    articles = load_index()
    published = [a for a in articles if a.get("status") == "published"]

    report = {}
    for art in published:
        slug = art.get("slug", "")
        added = ensure_bidirectional_links(slug)
        if added > 0:
            report[slug] = added

    return report


def md_to_html(md: str) -> str:
    """Convert markdown to HTML (simple converter like cap-numerik)."""
    lines = md.split("\n")
    html = ""
    in_list = False
    in_p = False

    for line in lines:
        t = line.strip()
        if t == "---":
            continue

        # Headers
        hm = re.match(r"^(#{1,6})\s(.+)", t)
        if hm:
            if in_p:
                html += "</p>"
                in_p = False
            if in_list:
                html += "</ul>"
                in_list = False
            lvl = len(hm.group(1))
            txt = _inline_md(hm.group(2))
            hid = slugify(re.sub(r"<[^>]+>", "", txt))
            html += f'<h{lvl} id="{hid}">{txt}</h{lvl}>\n'
            continue

        # List items
        lm = re.match(r"^[-*]\s(.+)", t)
        if lm:
            if in_p:
                html += "</p>"
                in_p = False
            if not in_list:
                html += "<ul>"
                in_list = True
            html += f"<li>{_inline_md(lm.group(1))}</li>\n"
            continue

        if in_list and not re.match(r"^[-*]\s", t):
            html += "</ul>"
            in_list = False

        if not t:
            if in_p:
                html += "</p>"
                in_p = False
            continue

        if not in_p:
            html += "<p>"
            in_p = True
        else:
            html += " "
        html += _inline_md(t)

    if in_p:
        html += "</p>"
    if in_list:
        html += "</ul>"
    return html


def _inline_md(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return text
