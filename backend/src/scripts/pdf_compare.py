#!/usr/bin/env python3
"""
pdf_compare.py — Comprehensive PDF Text and Visual Comparison Engine
Part of fileconvr Milestone 5 Advanced PDF Features
"""

import sys
import json
import os
import difflib
import pymupdf
from PIL import Image, ImageChops, ImageDraw

MAX_PAGE_LIMIT = 50

def compare_documents(file1_path, file2_path, output_dir, max_pages=MAX_PAGE_LIMIT, dpi=150):
    try:
        os.makedirs(output_dir, exist_ok=True)
        
        # 1. Open documents
        try:
            doc1 = pymupdf.open(file1_path)
        except Exception as e:
            return {"success": False, "code": "INVALID_DOC1", "message": f"Failed to open Document 1: {str(e)}"}
            
        try:
            doc2 = pymupdf.open(file2_path)
        except Exception as e:
            return {"success": False, "code": "INVALID_DOC2", "message": f"Failed to open Document 2: {str(e)}"}
            
        count1 = len(doc1)
        count2 = len(doc2)
        
        if count1 == 0:
            return {"success": False, "code": "EMPTY_DOC1", "message": "Document 1 has 0 pages."}
        if count2 == 0:
            return {"success": False, "code": "EMPTY_DOC2", "message": "Document 2 has 0 pages."}
            
        total_pages_to_compare = min(max(count1, count2), max_pages)
        zoom = dpi / 72.0
        mat = pymupdf.Matrix(zoom, zoom)
        
        page_comparisons = []
        pages_with_text_changes = []
        pages_with_visual_changes = []
        total_added_lines = 0
        total_removed_lines = 0
        all_sim_scores = []
        
        for idx in range(total_pages_to_compare):
            page_num = idx + 1
            has_p1 = idx < count1
            has_p2 = idx < count2
            
            p1 = doc1[idx] if has_p1 else None
            p2 = doc2[idx] if has_p2 else None
            
            # --- 2. Text Comparison ---
            t1 = p1.get_text() if has_p1 else ""
            t2 = p2.get_text() if has_p2 else ""
            
            lines1 = [ln for ln in t1.splitlines() if ln.strip()]
            lines2 = [ln for ln in t2.splitlines() if ln.strip()]
            
            matcher = difflib.SequenceMatcher(None, lines1, lines2)
            sim_score = matcher.ratio() if (lines1 or lines2) else 1.0
            all_sim_scores.append(sim_score)
            
            diff_lines = []
            added_cnt = 0
            removed_cnt = 0
            
            if not has_p1 and has_p2:
                # Page added in doc2
                for ln in lines2:
                    diff_lines.append({"type": "added", "text": ln})
                    added_cnt += 1
                text_has_changes = True
                status = "added"
            elif has_p1 and not has_p2:
                # Page removed in doc2
                for ln in lines1:
                    diff_lines.append({"type": "removed", "text": ln})
                    removed_cnt += 1
                text_has_changes = True
                status = "removed"
            else:
                # Both pages exist
                diff_gen = difflib.ndiff(lines1, lines2)
                for item in diff_gen:
                    code = item[:2]
                    val = item[2:]
                    if code == "+ ":
                        diff_lines.append({"type": "added", "text": val})
                        added_cnt += 1
                    elif code == "- ":
                        diff_lines.append({"type": "removed", "text": val})
                        removed_cnt += 1
                    elif code == "  ":
                        diff_lines.append({"type": "unchanged", "text": val})
                        
                text_has_changes = (added_cnt > 0 or removed_cnt > 0)
                status = "modified" if text_has_changes else "identical"
                
            total_added_lines += added_cnt
            total_removed_lines += removed_cnt
            if text_has_changes:
                pages_with_text_changes.append(page_num)
                
            # --- 3. Visual Comparison ---
            p1_dim = {"width": round(p1.rect.width, 2), "height": round(p1.rect.height, 2)} if has_p1 else None
            p2_dim = {"width": round(p2.rect.width, 2), "height": round(p2.rect.height, 2)} if has_p2 else None
            dimensions_match = (p1_dim == p2_dim) if (has_p1 and has_p2) else False
            
            doc1_img_name = f"doc1_p{page_num}.png" if has_p1 else None
            doc2_img_name = f"doc2_p{page_num}.png" if has_p2 else None
            diff_img_name = f"diff_p{page_num}.png"
            
            im1 = None
            im2 = None
            
            if has_p1:
                pix1 = p1.get_pixmap(matrix=mat, alpha=False)
                pix1.save(os.path.join(output_dir, doc1_img_name))
                im1 = Image.open(os.path.join(output_dir, doc1_img_name)).convert("RGB")
                
            if has_p2:
                pix2 = p2.get_pixmap(matrix=mat, alpha=False)
                pix2.save(os.path.join(output_dir, doc2_img_name))
                im2 = Image.open(os.path.join(output_dir, doc2_img_name)).convert("RGB")
                
            visual_has_changes = False
            diff_pct = 0.0
            
            if im1 and im2:
                # Normalize dimensions if they differ
                w = max(im1.width, im2.width)
                h = max(im1.height, im2.height)
                
                canvas1 = Image.new("RGB", (w, h), (255, 255, 255))
                canvas1.paste(im1, (0, 0))
                
                canvas2 = Image.new("RGB", (w, h), (255, 255, 255))
                canvas2.paste(im2, (0, 0))
                
                # Pixel difference
                diff_im = ImageChops.difference(canvas1, canvas2)
                bbox = diff_im.getbbox()
                
                if bbox or not dimensions_match:
                    # Create highlighted diff visualization
                    # Convert canvas2 to grayscale for high contrast background
                    gray_bg = canvas2.convert("L").convert("RGB")
                    # Highlight changed pixels in red/magenta
                    diff_gray = diff_im.convert("L")
                    threshold = 15 # Ignore tiny anti-aliasing variations
                    mask = diff_gray.point(lambda p: 255 if p > threshold else 0)
                    
                    highlight = Image.new("RGB", (w, h), (239, 68, 68)) # red
                    diff_vis = Image.composite(highlight, gray_bg, mask)
                    
                    # Count changed pixels
                    non_zero = mask.histogram()[255]
                    diff_pct = round((non_zero / (w * h)) * 100.0, 2)
                    
                    if diff_pct > 0.05 or not dimensions_match:
                        visual_has_changes = True
                        status = "modified" if status == "identical" else status
                        pages_with_visual_changes.append(page_num)
                        
                    diff_vis.save(os.path.join(output_dir, diff_img_name))
                else:
                    # Exactly identical pixels
                    diff_im.save(os.path.join(output_dir, diff_img_name))
            elif im1 and not im2:
                # Page removed
                visual_has_changes = True
                diff_pct = 100.0
                pages_with_visual_changes.append(page_num)
                # Save red-tinted removed banner
                im1.save(os.path.join(output_dir, diff_img_name))
            elif not im1 and im2:
                # Page added
                visual_has_changes = True
                diff_pct = 100.0
                pages_with_visual_changes.append(page_num)
                # Save green-tinted added banner
                im2.save(os.path.join(output_dir, diff_img_name))
                
            page_comparisons.append({
                "pageNumber": page_num,
                "status": status,
                "dimensionsMatch": dimensions_match,
                "doc1Dimensions": p1_dim,
                "doc2Dimensions": p2_dim,
                "textSimilarity": round(sim_score, 4),
                "textChanges": {
                    "hasChanges": text_has_changes,
                    "addedLines": added_cnt,
                    "removedLines": removed_cnt,
                    "diffLines": diff_lines[:100] # Cap snippet lines for JSON size
                },
                "visualChanges": {
                    "hasChanges": visual_has_changes,
                    "diffPercentage": diff_pct,
                    "diffImage": diff_img_name,
                    "doc1Image": doc1_img_name,
                    "doc2Image": doc2_img_name
                }
            })
            
        doc1.close()
        doc2.close()
        
        overall_similarity = round(sum(all_sim_scores) / max(1, len(all_sim_scores)), 4)
        are_identical = (
            count1 == count2
            and len(pages_with_textChanges) == 0
            and len(pages_with_visual_changes) == 0
        ) if 'pages_with_textChanges' in locals() else (
            count1 == count2
            and len(pages_with_text_changes) == 0
            and len(pages_with_visual_changes) == 0
        )
        
        return {
            "success": True,
            "areIdentical": are_identical,
            "doc1PageCount": count1,
            "doc2PageCount": count2,
            "comparedPagesCount": total_pages_to_compare,
            "pagesWithTextChanges": pages_with_text_changes,
            "pagesWithVisualChanges": pages_with_visual_changes,
            "totalAddedLines": total_added_lines,
            "totalRemovedLines": total_removed_lines,
            "overallSimilarityScore": overall_similarity,
            "pageComparisons": page_comparisons,
            "disclaimer": "Comparison clearly distinguishes text differences from visual raster differences. OCR variations, font anti-aliasing, and layout spacing can affect pixel diffs without semantic textual change."
        }
    except Exception as e:
        return {"success": False, "code": "COMPARE_ERROR", "message": f"PDF comparison failed: {str(e)}"}

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "message": "Usage: pdf_compare.py <file1> <file2> <output_dir> [max_pages] [dpi]"}))
        sys.exit(1)
        
    f1 = sys.argv[1]
    f2 = sys.argv[2]
    out_dir = sys.argv[3]
    max_pages = int(sys.argv[4]) if len(sys.argv) > 4 else MAX_PAGE_LIMIT
    dpi = int(sys.argv[5]) if len(sys.argv) > 5 else 150
    
    result = compare_documents(f1, f2, out_dir, max_pages, dpi)
    print(json.dumps(result))
    sys.exit(0 if result.get("success") else 1)

if __name__ == "__main__":
    main()
