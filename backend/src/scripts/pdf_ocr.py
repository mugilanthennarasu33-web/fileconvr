#!/usr/bin/env python3
"""
pdf_ocr.py — PDF Page Analysis, Image Rendering, and Searchable OCR Layer Application
Part of fileconvr Milestone 5 Advanced PDF Features
"""

import sys
import json
import os
import pymupdf

def detect_pages(input_path):
    try:
        doc = pymupdf.open(input_path)
        page_count = len(doc)
        if page_count == 0:
            return {"success": False, "code": "EMPTY_PDF", "message": "PDF contains no pages."}
        
        scanned_pages = []
        page_details = []
        
        for idx in range(page_count):
            page = doc[idx]
            text = page.get_text().strip()
            char_count = len(text)
            # If a page contains less than 30 characters of extractable text, it is considered scanned/image-based
            is_scanned = char_count < 30
            if is_scanned:
                scanned_pages.append(idx + 1) # 1-based
            page_details.append({
                "page": idx + 1,
                "width": round(page.rect.width, 2),
                "height": round(page.rect.height, 2),
                "rotation": page.rotation,
                "charCount": char_count,
                "isScanned": is_scanned
            })
            
        doc.close()
        return {
            "success": True,
            "pageCount": page_count,
            "scannedPages": scanned_pages,
            "pageDetails": page_details,
            "allScanned": len(scanned_pages) == page_count,
            "hasScannedPages": len(scanned_pages) > 0
        }
    except Exception as e:
        return {"success": False, "code": "INVALID_PDF", "message": str(e)}

def render_page(input_path, page_idx, output_png, dpi=200):
    try:
        doc = pymupdf.open(input_path)
        if page_idx < 0 or page_idx >= len(doc):
            return {"success": False, "message": f"Page index {page_idx} out of range (0-{len(doc)-1})"}
        page = doc[page_idx]
        zoom = dpi / 72.0
        mat = pymupdf.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        pix.save(output_png)
        doc.close()
        return {
            "success": True,
            "width": pix.width,
            "height": pix.height,
            "dpi": dpi,
            "scale": 72.0 / dpi
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

def apply_ocr_layer(input_path, output_path, ocr_data_path):
    try:
        with open(ocr_data_path, "r", encoding="utf-8") as f:
            ocr_data = json.load(f)
            
        doc = pymupdf.open(input_path)
        pages_ocred = 0
        total_words_inserted = 0
        
        for pdata in ocr_data.get("pages", []):
            page_idx = pdata.get("pageIndex")
            if page_idx < 0 or page_idx >= len(doc):
                continue
            page = doc[page_idx]
            scale = pdata.get("scale", 72.0 / 200.0)
            lines = pdata.get("lines", [])
            
            if lines:
                pages_ocred += 1
            
            for line in lines:
                text = line.get("text", "").strip()
                bbox = line.get("bbox") # [x0, y0, x1, y1] in image pixels
                if not text:
                    continue
                
                if bbox and len(bbox) == 4:
                    x0 = bbox[0] * scale
                    y0 = bbox[1] * scale
                    x1 = bbox[2] * scale
                    y1 = bbox[3] * scale
                    
                    # Ensure bbox is within page bounds
                    x0 = max(0, min(x0, page.rect.width - 2))
                    y0 = max(0, min(y0, page.rect.height - 2))
                    x1 = max(x0 + 2, min(x1, page.rect.width))
                    y1 = max(y0 + 2, min(y1, page.rect.height))
                    
                    rect = pymupdf.Rect(x0, y0, x1, y1)
                    fontsize = max(6.0, min(36.0, (y1 - y0) * 0.8))
                    
                    try:
                        # render_mode=3 is invisible text in PDF specification
                        page.insert_textbox(rect, text, fontsize=fontsize, render_mode=3)
                        total_words_inserted += len(text.split())
                    except Exception:
                        try:
                            page.insert_text(pymupdf.Point(x0, min(y1, page.rect.height - 2)), text, fontsize=fontsize, render_mode=3)
                            total_words_inserted += len(text.split())
                        except Exception:
                            pass
                else:
                    # Fallback without bbox: place at bottom or top of page
                    try:
                        page.insert_text(pymupdf.Point(36, 36), text, fontsize=10, render_mode=3)
                        total_words_inserted += len(text.split())
                    except Exception:
                        pass
                        
        doc.save(output_path, garbage=4, clean=True, deflate=True)
        doc.close()
        
        # Verify output can be read and extracted
        verify_doc = pymupdf.open(output_path)
        extracted_text_sample = ""
        for p in verify_doc:
            txt = p.get_text()
            if txt:
                extracted_text_sample += txt + "\n"
        final_page_count = len(verify_doc)
        verify_doc.close()
        
        return {
            "success": True,
            "pageCount": final_page_count,
            "pagesOcred": pages_ocred,
            "wordsInserted": total_words_inserted,
            "hasExtractedText": len(extracted_text_sample.strip()) > 0,
            "message": f"Successfully created searchable PDF with OCR layer across {pages_ocred} page(s)."
        }
    except Exception as e:
        return {"success": False, "message": f"Failed to apply OCR layer: {str(e)}"}

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "message": "Usage: pdf_ocr.py <detect|render_page|apply_ocr> <args...>"}))
        sys.exit(1)
        
    cmd = sys.argv[1]
    
    if cmd == "detect":
        input_pdf = sys.argv[2]
        res = detect_pages(input_pdf)
        print(json.dumps(res))
        sys.exit(0 if res.get("success") else 1)
        
    elif cmd == "render_page":
        input_pdf = sys.argv[2]
        page_idx = int(sys.argv[3])
        output_png = sys.argv[4]
        dpi = int(sys.argv[5]) if len(sys.argv) > 5 else 200
        res = render_page(input_pdf, page_idx, output_png, dpi)
        print(json.dumps(res))
        sys.exit(0 if res.get("success") else 1)
        
    elif cmd == "apply_ocr":
        input_pdf = sys.argv[2]
        output_pdf = sys.argv[3]
        ocr_data_path = sys.argv[4]
        res = apply_ocr_layer(input_pdf, output_pdf, ocr_data_path)
        print(json.dumps(res))
        sys.exit(0 if res.get("success") else 1)
        
    else:
        print(json.dumps({"success": False, "message": f"Unknown command: {cmd}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
