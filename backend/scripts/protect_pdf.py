import sys
import json
import os
import pymupdf

def main():
    try:
        # Read parameters from stdin to avoid exposing passwords in process commandline
        raw_input = sys.stdin.read()
        params = json.loads(raw_input)

        input_pdf = params.get("inputPath")
        output_pdf = params.get("outputPath")
        password = params.get("password")
        owner_password = params.get("ownerPassword") or password

        if not input_pdf or not output_pdf or not password:
            print(json.dumps({"success": False, "error": "Missing required parameters (inputPath, outputPath, password)."}))
            sys.exit(1)

        if not os.path.exists(input_pdf):
            print(json.dumps({"success": False, "error": "Input PDF file does not exist."}))
            sys.exit(1)

        doc = pymupdf.open(input_pdf)
        page_count = len(doc)

        if doc.is_encrypted:
            doc.close()
            print(json.dumps({"success": False, "error": "Document is already password-protected. Unlock it first before applying new encryption."}))
            sys.exit(1)

        # Standard AES-256 PDF Encryption
        doc.save(
            output_pdf,
            encryption=pymupdf.PDF_ENCRYPT_AES_256,
            user_pw=password,
            owner_pw=owner_password,
            permissions=pymupdf.PDF_PERM_ACCESSIBILITY | pymupdf.PDF_PERM_PRINT
        )
        doc.close()

        # Verify output requires password
        verify_doc = pymupdf.open(output_pdf)
        is_encrypted = verify_doc.is_encrypted
        verify_doc.close()

        if not is_encrypted:
            print(json.dumps({"success": False, "error": "Encryption verification failed: document is not protected."}))
            sys.exit(1)

        print(json.dumps({
            "success": True,
            "pageCount": page_count,
            "encryptionStandard": "AES-256",
            "isProtected": True
        }))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
