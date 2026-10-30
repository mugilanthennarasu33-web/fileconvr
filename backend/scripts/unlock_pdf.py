import sys
import json
import os
import pymupdf

def main():
    try:
        # Read parameters from stdin to avoid exposing passwords in process table
        raw_input = sys.stdin.read()
        params = json.loads(raw_input)

        input_pdf = params.get("inputPath")
        output_pdf = params.get("outputPath")
        password = params.get("password") or ""

        if not input_pdf or not output_pdf:
            print(json.dumps({"success": False, "error": "Missing inputPath or outputPath parameters."}))
            sys.exit(1)

        if not os.path.exists(input_pdf):
            print(json.dumps({"success": False, "error": "Input PDF file does not exist."}))
            sys.exit(1)

        doc = pymupdf.open(input_pdf)

        if not doc.is_encrypted:
            # Document is not encrypted, simply copy or save cleanly
            doc.save(output_pdf, encryption=pymupdf.PDF_ENCRYPT_NONE)
            page_count = len(doc)
            doc.close()
            print(json.dumps({
                "success": True,
                "pageCount": page_count,
                "wasEncrypted": False,
                "unlocked": True
            }))
            sys.exit(0)

        # Authenticate with provided password
        auth_result = doc.authenticate(password)
        if auth_result == 0:
            doc.close()
            print(json.dumps({
                "success": False,
                "error": "Authentication failed: Incorrect password provided for this document.",
                "authError": True
            }))
            sys.exit(1)

        # Remove encryption and save clean PDF
        unlocked_doc = pymupdf.open()
        unlocked_doc.insert_pdf(doc)
        unlocked_doc.save(output_pdf, encryption=pymupdf.PDF_ENCRYPT_NONE)
        page_count = len(unlocked_doc)

        unlocked_doc.close()
        doc.close()

        # Verify output is openable without password
        verify_doc = pymupdf.open(output_pdf)
        if verify_doc.is_encrypted:
            verify_doc.close()
            print(json.dumps({"success": False, "error": "Decryption verification failed: document remains encrypted."}))
            sys.exit(1)
        verify_doc.close()

        print(json.dumps({
            "success": True,
            "pageCount": page_count,
            "wasEncrypted": True,
            "unlocked": True
        }))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
