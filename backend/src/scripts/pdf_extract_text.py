#!/usr/bin/env python3
"""
pdf_extract_text.py — Extract structured page-annotated text from PDF
Part of fileconvr Milestone 5 Advanced PDF Features
"""

import sys
import json
import pymupdf

def extract_text(file_path):
    try:
        doc = pymupdf.open(file_path)
        page_count = len(doc)
        if page_count == 0:
            return {"success": False, "code": "EMPTY_PDF", "message": "PDF has no pages."}
            
        pages = []
        total_chars = 0
        
        for idx in range(page_count):
            p = doc[idx]
            txt = p.get_text().strip()
            char_count = len(txt)
            total_chars += char_count
            pages.append({
                "page": idx + 1,
                "text": txt,
                "charCount": char_count
            })
            
        doc.close()
        return {
            "success": True,
            "pageCount": page_count,
            "totalCharacters": total_chars,
            "pages": pages
        }
    except Exception as e:
        return {"success": False, "code": "EXTRACT_ERROR", "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "message": "Usage: pdf_extract_text.py <file_path>"}))
        sys.exit(1)
        
    res = extract_text(sys.argv[1])
    print(json.dumps(res))
    sys.exit(0 if res.get("success") else 1)
