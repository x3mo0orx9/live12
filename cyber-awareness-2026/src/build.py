#!/usr/bin/env python3
"""Build the single-file, offline presentation.

Reads deck.src.html, styles.css and app.js from this folder, expands the
bilingual shorthand, embeds the fonts and the logo as data URIs, and writes
../SMA-Cyber-Awareness.html. Python 3 only; no packages needed.

Shorthand in deck.src.html
  {{English||العربية}}        two <span>s, one per language
  @@HEAD:2@@                  slide header for part 2 (name and progress)
  @@HEAD:0:English||العربية@@ slide header outside the four parts
  @@ROAD:2@@                  the four-part road map, part 2 current
  <<FOOT:English||العربية>>   slide footer with its "Source" label
"""
import base64
import pathlib
import re
import sys

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent / "SMA-Cyber-Awareness.html"

# The four parts of the session, in order.
PARTS = [
    ("What is cybersecurity?", "ما هو الأمن السيبراني؟"),
    ("Types of attacks", "أنواع الهجمات"),
    ("How we protect ourselves", "كيف نحمي أنفسنا"),
    ("What to do and who to tell", "ماذا نفعل ومن نُبلغ"),
]
LOGO_ALT = "Sharjah Museums Authority · هيئة الشارقة للمتاحف"


def data_uri(path: pathlib.Path, mime: str) -> str:
    return "data:%s;base64,%s" % (mime, base64.b64encode(path.read_bytes()).decode("ascii"))


def both(en: str, ar: str) -> str:
    return '<span lang="en" dir="ltr">%s</span><span lang="ar" dir="rtl">%s</span>' % (en.strip(), ar.strip())


def state(i: int, part: int) -> str:
    return "done" if i < part else "now" if i == part else ""


def expand(html: str) -> str:
    def head(m):
        part = int(m.group(1))
        if part:
            label = both(*PARTS[part - 1])
            segs = "".join('<i class="%s"></i>' % state(i, part) for i in range(1, len(PARTS) + 1))
            segs = '<span class="segs" aria-hidden="true">%s</span>' % segs
        else:
            label, segs = both(m.group(2), m.group(3)), ""
        return ('<header class="hd"><span class="logo" role="img" aria-label="%s"></span>'
                '<div class="sect">%s%s</div></header>' % (LOGO_ALT, segs, label))

    def road(m):
        part = int(m.group(1))
        items = "".join('<li class="%s"><span class="n">%d</span>%s</li>' % (state(i, part), i, both(*PARTS[i - 1]))
                        for i in range(1, len(PARTS) + 1))
        return '<ol class="road">%s</ol>' % items

    def foot(m):
        return ('<footer class="ft"><p class="src"><span class="src-l">%s</span><span>%s</span></p>'
                '<span class="pg" aria-hidden="true"></span></footer>'
                % (both("Source", "المصدر"), both(m.group(1), m.group(2))))

    html = re.sub(r"@@HEAD:(\d)(?::(.*?)\|\|(.*?))?@@", head, html, flags=re.S)
    html = re.sub(r"@@ROAD:(\d)@@", road, html)
    html = re.sub(r"<<FOOT:(.*?)\|\|(.*?)>>", foot, html, flags=re.S)
    html = re.sub(r"\{\{(.*?)\|\|(.*?)\}\}", lambda m: both(m.group(1), m.group(2)), html, flags=re.S)
    return html


def main() -> int:
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    css = re.sub(r"url\((fonts/[^)]+\.woff2)\)",
                 lambda m: "url(%s)" % data_uri(SRC / m.group(1), "font/woff2"), css)
    css = re.sub(r"url\((assets/[^)]+\.png)\)",
                 lambda m: "url(%s)" % data_uri(SRC / m.group(1), "image/png"), css)
    js = (SRC / "app.js").read_text(encoding="utf-8")
    html = expand((SRC / "deck.src.html").read_text(encoding="utf-8"))
    left = re.findall(r"\{\{|\}\}|\[\[LOGO|@@HEAD|@@ROAD|<<FOOT", html)  # unexpanded shorthand
    html = html.replace("/*%%CSS%%*/", css).replace("/*%%JS%%*/", js)

    # The file must open with no network at all: refuse anything that would fetch.
    leaks = re.findall(r"""(?:src|href)\s*=\s*["'](?:https?:)?//[^"']+|url\(\s*["']?(?:https?:)?//[^)]+""", html)
    if leaks or left:
        print("build failed:", leaks[:5], left[:5], file=sys.stderr)
        return 1
    OUT.write_text(html, encoding="utf-8")
    print("wrote %s (%d KB, %d slides)" % (OUT.name, OUT.stat().st_size // 1024, html.count('<section class="slide')))
    return 0


if __name__ == "__main__":
    sys.exit(main())
