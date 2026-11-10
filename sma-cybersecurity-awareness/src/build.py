#!/usr/bin/env python3
"""Build the single-file presentation.

    python3 src/build.py

Reads the sources in this folder and writes ../index.html with the styles,
scripts, fonts, icons and logo all inlined, so the result opens from disk
(file://) with no server and no network.

Authoring shortcut: write bilingual text in index.src.html as
    {{English text||النص العربي}}
The build expands it to a pair of <span lang="en"> / <span lang="ar">; the
stylesheet shows only the span matching <html lang>.
"""
import base64
import pathlib
import re

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent / "index.html"


def data_uri(rel_path: str, mime: str) -> str:
    raw = (SRC / rel_path).read_bytes()
    return f"data:{mime};base64," + base64.b64encode(raw).decode("ascii")


def bilingual(html: str) -> str:
    def expand(match: re.Match) -> str:
        en, ar = match.group(1).strip(), match.group(2).strip()
        return f'<span lang="en">{en}</span><span lang="ar">{ar}</span>'

    return re.sub(r"\{\{(.*?)\|\|(.*?)\}\}", expand, html, flags=re.S)


def main() -> None:
    css = (SRC / "styles.css").read_text("utf-8")
    css = re.sub(
        r"url\((fonts/[^)]+\.woff2)\)",
        lambda m: f"url({data_uri(m.group(1), 'font/woff2')})",
        css,
    )
    css = css.replace(
        "url(assets/sma-logo-white.png)",
        f"url({data_uri('assets/sma-logo-white.png', 'image/png')})",
    )

    js = "\n".join((SRC / name).read_text("utf-8") for name in ("app.js", "sims.js"))
    js = js.replace("</script", "<\\/script")

    html = bilingual((SRC / "index.src.html").read_text("utf-8"))
    leftovers = re.findall(r"\{\{|\}\}|\|\|", re.sub(r'data-title="[^"]*"', "", html))
    if leftovers:
        raise SystemExit(f"Unexpanded template markers: {sorted(set(leftovers))}")

    html = html.replace("<!--@css-->", f"<style>\n{css}\n</style>")
    html = html.replace("<!--@icons-->", (SRC / "icons.svg").read_text("utf-8"))
    html = html.replace("<!--@js-->", f"<script>\n{js}\n</script>")

    OUT.write_text(html, "utf-8")
    print(f"Built {OUT.relative_to(SRC.parent.parent)}  ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
