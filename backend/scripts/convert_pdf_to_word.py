import sys
import json
import os

def convert(input_pdf, output_docx):
    if not os.path.exists(input_pdf):
        print(json.dumps({"success": False, "error": "Input PDF file does not exist."}))
        sys.exit(1)

    try:
        from pdf2docx import Converter
        import fitz  # PyMuPDF

        # Inspect if document is scanned (check text content across pages)
        doc = fitz.open(input_pdf)
        page_count = len(doc)
        total_text_length = 0
        for page in doc:
            total_text_length += len(page.get_text().strip())
        doc.close()

        is_scanned = total_text_length < 10

        # Execute layout-preserving conversion
        cv = Converter(input_pdf)
        cv.convert(output_docx, start=0, end=None)
        cv.close()

        if not os.path.exists(output_docx) or os.path.getsize(output_docx) == 0:
            print(json.dumps({"success": False, "error": "Generated DOCX file is empty or failed to write."}))
            sys.exit(1)

        print(json.dumps({
            "success": True,
            "pageCount": page_count,
            "totalTextLength": total_text_length,
            "isScanned": is_scanned,
            "ocrRequired": is_scanned
        }))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Usage: python convert_pdf_to_word.py <input.pdf> <output.docx>"}))
        sys.exit(1)

    convert(sys.argv[1], sys.argv[2])
