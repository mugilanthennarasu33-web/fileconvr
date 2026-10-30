import sys
import json
import os
import pymupdf as fitz

def repair_pdf(input_path, output_path):
    if not os.path.exists(input_path):
        return {
            "success": False,
            "code": "FILE_NOT_FOUND",
            "message": f"Input file not found at: {input_path}"
        }

    try:
        # Check original file size
        orig_size = os.path.getsize(input_path)
        if orig_size < 10:
            return {
                "success": False,
                "code": "UNRECOVERABLE_PDF",
                "message": "File is empty or too small to contain valid PDF structures."
            }

        # Open with PyMuPDF repair mode
        doc = fitz.open(input_path)
        page_count = len(doc)
        if page_count == 0:
            return {
                "success": False,
                "code": "UNRECOVERABLE_PDF",
                "message": "No pages or document objects could be recovered from the damaged file."
            }

        # Verify readability by inspecting first page
        try:
            first_page = doc[0]
            _ = first_page.rect
        except Exception as e:
            return {
                "success": False,
                "code": "UNRECOVERABLE_PDF",
                "message": f"Page structure is corrupted and cannot be rendered: {str(e)}"
            }

        # Save reconstructed document with full garbage collection and stream sanitization
        doc.save(
            output_path,
            garbage=4,
            clean=True,
            deflate=True
        )
        doc.close()

        # Validate that the repaired output exists and is non-empty
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            return {
                "success": False,
                "code": "REPAIR_FAILED",
                "message": "Failed to write repaired document."
            }

        repaired_size = os.path.getsize(output_path)
        return {
            "success": True,
            "pageCount": page_count,
            "originalSizeBytes": orig_size,
            "repairedSizeBytes": repaired_size,
            "message": f"Successfully recovered and validated {page_count} page(s)."
        }

    except Exception as e:
        return {
            "success": False,
            "code": "UNRECOVERABLE_PDF",
            "message": f"Document is severely corrupted and cannot be repaired: {str(e)}"
        }

def main():
    if len(sys.argv) < 3:
        # Read from stdin JSON
        try:
            payload = json.loads(sys.stdin.read())
            input_path = payload.get("inputPath")
            output_path = payload.get("outputPath")
        except Exception:
            print(json.dumps({"success": False, "code": "INVALID_ARGUMENTS", "message": "Missing input and output paths."}))
            sys.exit(1)
    else:
        input_path = sys.argv[1]
        output_path = sys.argv[2]

    res = repair_pdf(input_path, output_path)
    print(json.dumps(res))
    if not res.get("success"):
        sys.exit(1)

if __name__ == "__main__":
    main()
