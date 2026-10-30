import sys
import json
import os
import pymupdf

def parse_hex_color(hex_str):
    if not hex_str:
        return (0.2, 0.2, 0.2)
    clean = hex_str.replace('#', '').strip()
    try:
        if len(clean) == 3:
            r = int(clean[0] * 2, 16) / 255.0
            g = int(clean[1] * 2, 16) / 255.0
            b = int(clean[2] * 2, 16) / 255.0
            return (r, g, b)
        elif len(clean) == 6:
            r = int(clean[0:2], 16) / 255.0
            g = int(clean[2:4], 16) / 255.0
            b = int(clean[4:6], 16) / 255.0
            return (r, g, b)
    except Exception:
        pass
    return (0.2, 0.2, 0.2)

def parse_page_ranges(ranges_str, total_pages):
    if not ranges_str or not ranges_str.strip():
        return list(range(total_pages))
    
    pages = set()
    parts = [p.strip() for p in ranges_str.split(',') if p.strip()]
    for part in parts:
        if '-' in part:
            sub = [s.strip() for s in part.split('-')]
            start = int(sub[0])
            end = int(sub[1])
            if start < 1 or end < start:
                raise ValueError(f"Invalid range: {part}")
            for p in range(start, end + 1):
                if p <= total_pages:
                    pages.add(p - 1)
        else:
            p = int(part)
            if p <= total_pages and p >= 1:
                pages.add(p - 1)
    return sorted(list(pages))

def main():
    try:
        raw_input = sys.stdin.read()
        params = json.loads(raw_input)

        input_pdf = params.get("inputPath")
        output_pdf = params.get("outputPath")
        position = params.get("position", "bottom-center")
        num_format = params.get("format", "page-n-of-total")
        start_number = int(params.get("startNumber", 1))
        prefix = params.get("prefix", "")
        suffix = params.get("suffix", "")
        font_size = float(params.get("fontSize", 10))
        color_hex = params.get("color", "#333333")
        margin = float(params.get("margin", 25))
        pages_selection = params.get("pages", "all")
        exclude_first_page = bool(params.get("excludeFirstPage", False))

        if not input_pdf or not output_pdf:
            print(json.dumps({"success": False, "error": "Missing inputPath or outputPath parameters."}))
            sys.exit(1)

        if not os.path.exists(input_pdf):
            print(json.dumps({"success": False, "error": "Input PDF file does not exist."}))
            sys.exit(1)

        doc = pymupdf.open(input_pdf)
        if doc.is_encrypted:
            doc.close()
            print(json.dumps({"success": False, "error": "Document is password protected. Unlock it first."}))
            sys.exit(1)

        total_pages = len(doc)
        if total_pages == 0:
            doc.close()
            print(json.dumps({"success": False, "error": "PDF has no pages."}))
            sys.exit(1)

        # Resolve pages to number
        if pages_selection == "all":
            target_indices = list(range(total_pages))
        elif pages_selection == "odd":
            target_indices = [i for i in range(total_pages) if (i + 1) % 2 != 0]
        elif pages_selection == "even":
            target_indices = [i for i in range(total_pages) if (i + 1) % 2 == 0]
        else:
            target_indices = parse_page_ranges(pages_selection, total_pages)

        if exclude_first_page and 0 in target_indices:
            target_indices.remove(0)

        font = pymupdf.Font("helv")
        text_color = parse_hex_color(color_hex)
        numbered_count = 0

        # Numbering counter starts at start_number
        current_num = start_number
        for idx in range(total_pages):
            if idx not in target_indices:
                continue

            page = doc[idx]
            v_width = page.rect.width
            v_height = page.rect.height

            # Format label
            if num_format == "number":
                label = f"{prefix}{current_num}{suffix}"
            elif num_format == "page-n":
                label = f"{prefix}Page {current_num}{suffix}"
            else: # page-n-of-total
                label = f"{prefix}Page {current_num} of {total_pages}{suffix}"

            tw = font.text_length(label, font_size)

            # Horizontal placement
            if "left" in position:
                x = margin
            elif "right" in position:
                x = v_width - margin - tw
            else: # center
                x = (v_width - tw) / 2.0

            # Vertical placement
            if position.startswith("top"):
                y = margin + font_size
            else: # bottom
                y = v_height - margin

            page.insert_text(
                pymupdf.Point(x, y),
                label,
                fontsize=font_size,
                color=text_color,
                fontname="helv"
            )
            numbered_count += 1
            current_num += 1

        doc.save(output_pdf)
        doc.close()

        print(json.dumps({
            "success": True,
            "pageCount": total_pages,
            "numberedPagesCount": numbered_count
        }))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
