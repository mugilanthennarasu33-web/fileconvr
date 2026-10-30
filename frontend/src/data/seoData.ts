/**
 * SEO Configuration & Page Metadata Dictionary for fileconvr
 * Configurable production URL defaults to https://fileconvr.com or VITE_SITE_URL.
 */

export const SITE_CONFIG = {
  name: 'fileconvr',
  tagline: 'Convert. Manage. Simplify.',
  defaultTitle: 'fileconvr — Free Online PDF Converter & PDF Utility Platform',
  defaultDescription:
    'fileconvr is a high-speed, privacy-first PDF utility platform. Merge, split, compress, convert, edit, OCR, repair, and protect your PDF documents with zero logging.',
  baseUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL)
    ? import.meta.env.VITE_SITE_URL.replace(/\/$/, '')
    : 'https://fileconvr.com',
  author: 'fileconvr Team',
  twitterHandle: '@fileconvr',
  themeColor: '#020617', // slate-950
};

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolSeoContent {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  howToSteps: string[];
  features: string[];
  supportedFormats: {
    input: string[];
    output: string[];
    maxSizeMB: number;
  };
  privacyNotice: string;
  faqs: ToolFaqItem[];
  relatedTools: string[];
  softwareType: string;
}

export const TOOLS_SEO_DATA: Record<string, ToolSeoContent> = {
  'merge-pdf': {
    slug: 'merge-pdf',
    title: 'Merge PDF Online — Combine Multiple PDF Files Free | fileconvr',
    metaDescription:
      'Combine multiple PDF files into one organized document in seconds. Free, high-speed PDF combiner with interactive page ordering and 100% privacy.',
    h1: 'Merge PDF Documents Online',
    intro:
      'Combine multiple PDF documents into a single, cohesive file effortlessly. Drag, drop, sort alphabetically or reorder pages manually before merging with zero quality loss.',
    howToSteps: [
      'Select or drag and drop two or more PDF files into the upload area.',
      'Reorder the documents using the move buttons or click "Sort A-Z" to order alphabetically.',
      'Click "Merge PDF Files" to combine the files in memory.',
      'Download your merged PDF document immediately.',
    ],
    features: [
      'Interactive visual reordering and alphabetical sorting',
      'Lossless page combination preserving vector fonts and forms',
      'Batch processing for up to 100MB total payload',
      'No registration required for standard merging',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Your files are processed ephemerally in-memory. Merged documents are automatically purged from server storage within 60 minutes.',
    faqs: [
      {
        question: 'Is it safe to merge confidential PDF files on fileconvr?',
        answer:
          'Yes. All file transfers use TLS/SSL encryption, files are processed in isolated memory streams, and all temporary assets are automatically deleted after 60 minutes.',
      },
      {
        question: 'Will merging PDFs degrade text or image quality?',
        answer:
          'No. fileconvr performs lossless merging, preserving original vector curves, embedded fonts, image resolutions, and form fields.',
      },
      {
        question: 'Can I change the order of files before merging?',
        answer:
          'Yes. Use the Move Up, Move Down, and Sort A-Z controls in the file list to arrange your documents in the exact order desired.',
      },
      {
        question: 'How many PDF documents can I merge at once?',
        answer:
          'You can merge up to 20 files per batch under the 100MB cumulative file size limit.',
      },
    ],
    relatedTools: ['split-pdf', 'organize-pdf', 'compress-pdf', 'rotate-pdf'],
    softwareType: 'DocumentUtility',
  },

  'split-pdf': {
    slug: 'split-pdf',
    title: 'Split PDF Online — Extract Pages from PDF Free | fileconvr',
    metaDescription:
      'Split PDF documents into separate files by page range or extract single pages online. Fast, secure, and preserves complete document formatting.',
    h1: 'Split PDF Pages & Custom Ranges',
    intro:
      'Extract specific pages or break a large PDF into multiple individual documents. Specify custom page intervals like "1-3, 5, 8-10" with real-time validation.',
    howToSteps: [
      'Upload the PDF document you want to split.',
      'Enter the target page ranges (e.g., 1-5, 8, 11-14) or select extract mode.',
      'Click "Split PDF" to process the selected segments.',
      'Download your extracted PDF files individually or as a single ZIP archive.',
    ],
    features: [
      'Custom range splitting with flexible comma-delimited syntax',
      'Extract single pages or split into individual one-page files',
      'Fast client-side validation against total page count',
      'Automatic ZIP archiving for multi-range extractions',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['PDF (.pdf)', 'ZIP archive (.zip)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Uploaded documents are processed strictly in memory and automatically removed from temporary storage within 60 minutes.',
    faqs: [
      {
        question: 'How do I specify which pages to extract?',
        answer:
          'Enter page numbers and ranges separated by commas, such as "1-4, 7, 9-12". The tool validates that page numbers do not exceed the document total.',
      },
      {
        question: 'Can I extract bookmarks or table of contents along with pages?',
        answer:
          'Yes, standard internal page links and fonts associated with the extracted pages remain functional in the output files.',
      },
      {
        question: 'Is there a limit on the number of pages I can split?',
        answer:
          'You can split documents of any page count as long as the file size is within the 100MB limit.',
      },
    ],
    relatedTools: ['merge-pdf', 'organize-pdf', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'compress-pdf': {
    slug: 'compress-pdf',
    title: 'Compress PDF Online — Reduce PDF File Size Free | fileconvr',
    metaDescription:
      'Reduce PDF file size online without losing visual quality. Choose between recommended, high, or extreme compression levels for emails and uploads.',
    h1: 'Compress PDF File Size Online',
    intro:
      'Optimize heavy PDF documents for email attachments, web publishing, and application submissions. Balance file size reduction and image clarity with three compression tiers.',
    howToSteps: [
      'Upload the PDF document you need to shrink.',
      'Select your preferred compression level: Recommended (Balanced), High, or Extreme.',
      'Click "Compress PDF" to optimize document streams and raster objects.',
      'Inspect the size reduction percentage and download your optimized file.',
    ],
    features: [
      'Three optimization profiles: Recommended, High, and Extreme',
      'Stream deduplication and font subset optimization',
      'Live reduction counter showing saved megabytes and percentage',
      'Preserves text clarity and vector graphics fidelity',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Documents are compressed using ephemeral processing containers and permanently deleted after 60 minutes.',
    faqs: [
      {
        question: 'Will compressing my PDF make the text blurry?',
        answer:
          'No. Vector text and font glyphs are preserved without rasterization. Compression primarily optimizes redundant object streams and re-encodes oversized embedded images.',
      },
      {
        question: 'How much can fileconvr reduce my PDF file size?',
        answer:
          'Depending on the contents, documents with heavy uncompressed imagery can see up to 70-85% size reduction under High compression.',
      },
    ],
    relatedTools: ['merge-pdf', 'pdf-to-word', 'repair-pdf'],
    softwareType: 'DocumentUtility',
  },

  'rotate-pdf': {
    slug: 'rotate-pdf',
    title: 'Rotate PDF Online — Permanently Rotate PDF Pages Free | fileconvr',
    metaDescription:
      'Rotate PDF pages 90, 180, or 270 degrees online. Rotate all pages or target portrait and landscape pages independently with permanent orientation save.',
    h1: 'Rotate PDF Pages & Orientations',
    intro:
      'Fix upside-down scans and sideways documents instantly. Rotate all pages clockwise or counter-clockwise, or target only portrait or landscape pages.',
    howToSteps: [
      'Upload your PDF file.',
      'Select the rotation angle (90°, 180°, or 270° clockwise).',
      'Choose whether to apply to all pages, only portrait pages, or only landscape pages.',
      'Click "Rotate PDF" and download the permanently re-oriented document.',
    ],
    features: [
      '90°, 180°, and 270° clockwise and counter-clockwise rotation',
      'Targeted rotation by orientation (portrait vs landscape)',
      'Permanent page-rotation flag update without re-rasterizing text',
      'Fast instant processing under 2 seconds',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Files are rotated in memory and deleted from server storage within 60 minutes.',
    faqs: [
      {
        question: 'Does rotating a PDF degrade the quality?',
        answer:
          'Not at all. Rotation modifies the PDF page matrix metadata without modifying the underlying text or image data streams.',
      },
    ],
    relatedTools: ['organize-pdf', 'merge-pdf', 'split-pdf'],
    softwareType: 'DocumentUtility',
  },

  'organize-pdf': {
    slug: 'organize-pdf',
    title: 'Organize PDF Pages — Reorder, Delete & Rotate Visually | fileconvr',
    metaDescription:
      'Visually organize PDF pages online. Drag to reorder, delete unwanted pages, and rotate individual pages with live interactive page thumbnails.',
    h1: 'Organize & Reorder PDF Pages',
    intro:
      'Take full control of your document layout with a visual page grid. Drag and drop pages to rearrange, delete unnecessary sheets, and adjust individual orientations.',
    howToSteps: [
      'Upload your PDF document to render the interactive page gallery.',
      'Drag and drop page cards to reorder them in your desired sequence.',
      'Hover over any page card to delete it or rotate it 90 degrees.',
      'Click "Save & Download" to generate your reorganized PDF file.',
    ],
    features: [
      'Visual interactive page thumbnails rendered in real time',
      'Drag-and-drop page reordering',
      'Single-click page deletion and per-page rotation controls',
      'Duplicate pages or insert blanks effortlessly',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Page previews are rendered locally in the browser where possible, and backend operations are purged within 60 minutes.',
    faqs: [
      {
        question: 'Can I remove specific pages from a PDF?',
        answer:
          'Yes. Click the trash icon on any page thumbnail in the organize view to delete that page before saving.',
      },
    ],
    relatedTools: ['merge-pdf', 'split-pdf', 'rotate-pdf'],
    softwareType: 'DocumentUtility',
  },

  'page-numbers-pdf': {
    slug: 'page-numbers-pdf',
    title: 'Add Page Numbers to PDF — Number Pages Online | fileconvr',
    metaDescription:
      'Add page numbers to PDF documents online. Choose position, font format, numbering style, and skip cover pages with flexible margin controls.',
    h1: 'Add Page Numbers to PDF Documents',
    intro:
      'Stamp clean, professional page numbering across any PDF. Select from bottom-center, top-right, or margin positions with formats like "Page 1 of N".',
    howToSteps: [
      'Upload the PDF document you want to number.',
      'Select position (e.g. Bottom Center, Bottom Right, Top Center).',
      'Choose numbering format (e.g. "1, 2, 3" or "Page {n} of {total}").',
      'Optionally toggle "Exclude first page" to skip cover sheets.',
      'Click "Add Page Numbers" and download your numbered PDF.',
    ],
    features: [
      '6 alignment positions across header and footer margins',
      'Custom numbering formats including "Page n of total"',
      'Skip cover page / first page options',
      'Customizable starting number offset',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Documents are processed in memory and deleted from server storage within 60 minutes.',
    faqs: [
      {
        question: 'Can I skip numbering on the cover page?',
        answer:
          'Yes. Check the "Exclude first page" option to begin numbering from page 2 onwards.',
      },
    ],
    relatedTools: ['watermark-pdf', 'organize-pdf', 'merge-pdf'],
    softwareType: 'DocumentUtility',
  },

  'watermark-pdf': {
    slug: 'watermark-pdf',
    title: 'Add Watermark to PDF Online — Protect Documents Free | fileconvr',
    metaDescription:
      'Add text or image watermarks to PDF files online. Custom opacity, angle, 3x3 position alignment, and font controls for confidential documents.',
    h1: 'Add Custom Watermark to PDF',
    intro:
      'Protect intellectual property and mark documents as "CONFIDENTIAL", "DRAFT", or custom branded text. Fine-tune rotation angle, opacity, and positioning.',
    howToSteps: [
      'Upload your PDF file.',
      'Type your custom watermark text or upload a logo image.',
      'Adjust opacity, rotation angle (e.g. 45° diagonal), and placement.',
      'Click "Apply Watermark" and download your watermarked file.',
    ],
    features: [
      'Custom text and image watermark support',
      'Precision opacity slider (10% to 100%)',
      'Rotational angles (-90° to +90°) and diagonal alignment',
      'Full 3x3 grid alignment (Top, Center, Bottom / Left, Middle, Right)',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Watermarked documents are generated in isolated memory containers and purged after 60 minutes.',
    faqs: [
      {
        question: 'Will the watermark overwrite my existing PDF text?',
        answer:
          'You can configure the watermark opacity so your underlying document text remains legible while clearly protected by the watermark overlay.',
      },
    ],
    relatedTools: ['protect-pdf', 'page-numbers-pdf', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'pdf-to-word': {
    slug: 'pdf-to-word',
    title: 'PDF to Word Converter — Convert PDF to DOCX Online Free | fileconvr',
    metaDescription:
      'Convert PDF documents to editable Microsoft Word DOCX files online. High-accuracy layout reconstruction, table detection, and typography preservation.',
    h1: 'Convert PDF to Editable Word (DOCX)',
    intro:
      'Transform static PDF documents into fully editable Microsoft Word (.docx) files. Reconstruct paragraphs, tabular data, and formatting effortlessly.',
    howToSteps: [
      'Upload the PDF document you wish to convert.',
      'Click "Convert to Word" to initiate structural analysis.',
      'Wait a few moments as paragraphs, headings, and tables are mapped to DOCX.',
      'Download your editable Microsoft Word document.',
    ],
    features: [
      'Accurate paragraph and heading structure recovery',
      'Table border and cell data extraction',
      'Preserves font stylings, lists, and alignments',
      'Produces clean, standard OpenXML DOCX files compatible with Word, Google Docs, and LibreOffice',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['Microsoft Word (.docx)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Converted Word files and source PDFs are automatically deleted from server memory within 60 minutes.',
    faqs: [
      {
        question: 'Can I edit the converted Word document in Google Docs or Microsoft 365?',
        answer:
          'Yes. The output is a standard .docx file fully compatible with Microsoft Word, Google Docs, Apple Pages, and LibreOffice Writer.',
      },
    ],
    relatedTools: ['word-to-pdf', 'ocr-pdf', 'pdf-to-img'],
    softwareType: 'DocumentUtility',
  },

  'word-to-pdf': {
    slug: 'word-to-pdf',
    title: 'Word to PDF Converter — Convert DOCX to PDF Online Free | fileconvr',
    metaDescription:
      'Convert Microsoft Word DOC and DOCX files to PDF online with perfect typography, margin alignment, and vector clarity. 100% free converter.',
    h1: 'Convert Word to Standard PDF',
    intro:
      'Convert DOC and DOCX documents to standard PDF format with perfect layout fidelity. Ensure recipients see your document exactly as intended across all devices.',
    howToSteps: [
      'Upload your Word file (.docx or .doc).',
      'Click "Convert to PDF" to start layout rasterization.',
      'Download your publication-ready vector PDF document.',
    ],
    features: [
      'Supports modern DOCX and legacy DOC formats',
      'Retains bullet points, tables, styles, and font weights',
      'Generates compact, universally readable PDF files',
      'Immediate download with zero document storage',
    ],
    supportedFormats: {
      input: ['Microsoft Word (.docx, .doc)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Word files are converted in ephemeral sandbox workers and purged after 60 minutes.',
    faqs: [
      {
        question: 'Will my fonts and styles look the same in the PDF?',
        answer:
          'Yes. Font metrics and layout specifications are preserved to match the original Word layout.',
      },
    ],
    relatedTools: ['pdf-to-word', 'excel-to-pdf', 'ppt-to-pdf'],
    softwareType: 'DocumentUtility',
  },

  'excel-to-pdf': {
    slug: 'excel-to-pdf',
    title: 'Excel to PDF Converter — Convert XLS & XLSX to PDF | fileconvr',
    metaDescription:
      'Convert Excel spreadsheets (XLS, XLSX) into formatted PDF documents. Preserve cell borders, tabular structures, and multi-sheet workbooks.',
    h1: 'Convert Excel Workbooks to PDF',
    intro:
      'Turn financial sheets, reports, and data grids into clean PDF documents. Automatically formats multi-sheet workbooks into structured pages.',
    howToSteps: [
      'Select or drag your Excel file (.xlsx or .xls) into the uploader.',
      'Click "Convert to PDF".',
      'Download your formatted spreadsheet PDF.',
    ],
    features: [
      'Multi-sheet workbook support',
      'Maintains tabular cell borders and numerical formatting',
      'Optimized page breaks for wide tables',
    ],
    supportedFormats: {
      input: ['Excel (.xlsx, .xls)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Spreadsheets are processed securely and deleted within 60 minutes.',
    faqs: [
      {
        question: 'Does this handle multi-sheet workbooks?',
        answer:
          'Yes, each sheet in your Excel workbook is rendered sequentially in the output PDF document.',
      },
    ],
    relatedTools: ['word-to-pdf', 'ppt-to-pdf', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'ppt-to-pdf': {
    slug: 'ppt-to-pdf',
    title: 'PowerPoint to PDF Converter — Convert PPTX to PDF | fileconvr',
    metaDescription:
      'Convert PowerPoint presentations (PPT, PPTX) to PDF documents online. Preserve slide dimensions, typography, and visual designs in high resolution.',
    h1: 'Convert PowerPoint Slides to PDF',
    intro:
      'Transform presentation slide decks into shareable, print-ready PDF files. Perfect for handouts, slide distribution, and client proposals.',
    howToSteps: [
      'Upload your PowerPoint file (.pptx or .ppt).',
      'Click "Convert to PDF".',
      'Download your landscape presentation PDF.',
    ],
    features: [
      'Supports PPTX and PPT formats',
      'Landscape orientation matching standard 16:9 and 4:3 slide ratios',
      'Crisp vector text and image rendering',
    ],
    supportedFormats: {
      input: ['PowerPoint (.pptx, .ppt)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Presentations are converted in memory and deleted from storage within 60 minutes.',
    faqs: [
      {
        question: 'Are slide notes included?',
        answer:
          'The conversion outputs the primary visual slides as individual PDF pages.',
      },
    ],
    relatedTools: ['word-to-pdf', 'excel-to-pdf', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'pdf-to-img': {
    slug: 'pdf-to-img',
    title: 'PDF to JPG Converter — Convert PDF Pages to Images Free | fileconvr',
    metaDescription:
      'Convert PDF pages into high-resolution JPG images online. Download single page images or a complete ZIP package of all rendered sheets.',
    h1: 'Convert PDF Pages to High-Res JPG Images',
    intro:
      'Extract pages from any PDF document as crisp, high-resolution JPEG images. Ideal for embedding documents in presentations, social media, or web pages.',
    howToSteps: [
      'Upload your PDF document.',
      'Click "Convert to JPG" to rasterize each page at high DPI.',
      'Preview generated thumbnails.',
      'Download individual images or grab all pages in a single ZIP file.',
    ],
    features: [
      'High-DPI rasterization for sharp text and graphics',
      'Individual image download or combined ZIP bundle',
      'Fast client and server hybrid rendering',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['JPEG (.jpg)', 'ZIP archive (.zip)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Rendered images and source documents are automatically deleted after 60 minutes.',
    faqs: [
      {
        question: 'What image quality does this converter produce?',
        answer:
          'Pages are rasterized at high resolution, preserving fine text details and diagram fidelity.',
      },
    ],
    relatedTools: ['img-to-pdf', 'pdf-to-word', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'img-to-pdf': {
    slug: 'img-to-pdf',
    title: 'JPG to PDF Converter — Convert Images to PDF Online Free | fileconvr',
    metaDescription:
      'Convert JPG, PNG, WEBP, and GIF images into clean PDF documents. Arrange photo order, select orientation, and set margins before creating your PDF.',
    h1: 'Convert Images (JPG, PNG) to PDF',
    intro:
      'Combine photos, receipts, illustrations, and image scans into a standardized PDF document. Reorder pictures and customize page orientation effortlessly.',
    howToSteps: [
      'Upload one or more JPG, PNG, or image files.',
      'Arrange image sequence using drag-and-drop or reorder controls.',
      'Select orientation (Portrait or Landscape) and margin preferences.',
      'Click "Create PDF" and download your document.',
    ],
    features: [
      'Supports JPG, JPEG, PNG, WEBP, and GIF inputs',
      'Multiple image batch consolidation into a single PDF',
      'Custom margin and page orientation controls',
      'Lossless image compression inside the PDF container',
    ],
    supportedFormats: {
      input: ['Images (.jpg, .jpeg, .png, .webp, .gif)'],
      output: ['PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Uploaded images are compiled in memory and purged within 60 minutes.',
    faqs: [
      {
        question: 'Can I combine multiple pictures into one PDF file?',
        answer:
          'Yes. Upload all your images, arrange them in the sequence you want, and they will be compiled into consecutive pages in a single PDF.',
      },
    ],
    relatedTools: ['pdf-to-img', 'merge-pdf', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'protect-pdf': {
    slug: 'protect-pdf',
    title: 'Protect PDF with Password — Encrypt PDF Online Free | fileconvr',
    metaDescription:
      'Protect PDF documents with military-grade AES-256 encryption. Set open passwords to prevent unauthorized access and secure sensitive documents.',
    h1: 'Protect PDF with AES-256 Password Encryption',
    intro:
      'Lock sensitive documents, financial records, and legal agreements with industry-standard AES-256 encryption. Prevent unauthorized viewing without the correct passphrase.',
    howToSteps: [
      'Upload the PDF document you want to secure.',
      'Enter and confirm a strong password.',
      'Click "Protect PDF" to encrypt the document streams.',
      'Download your password-protected PDF file.',
    ],
    features: [
      'Standard AES-256 bit encryption',
      'Prevents unauthorized document opening without passphrase',
      'No password storage — cryptographic keys are derived ephemerally',
      'Compatible with Adobe Acrobat, Apple Preview, and modern browsers',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['Encrypted PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'fileconvr never logs or stores your document password. Encrypted files are purged from memory within 60 minutes.',
    faqs: [
      {
        question: 'What happens if I forget the password I set?',
        answer:
          'Because fileconvr does not store passwords or encryption keys, forgotten passwords cannot be recovered. Make sure to record your password securely.',
      },
    ],
    relatedTools: ['unlock-pdf', 'watermark-pdf', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'unlock-pdf': {
    slug: 'unlock-pdf',
    title: 'Unlock PDF Online — Remove Password from PDF Free | fileconvr',
    metaDescription:
      'Remove password protection from authorized PDF files online. Decrypt password-protected documents to read, print, and edit freely.',
    h1: 'Unlock Password-Protected PDF',
    intro:
      'Remove encryption and security restrictions from authorized PDF files once you provide the valid password. Enjoy unrestricted reading, copying, and printing.',
    howToSteps: [
      'Upload the password-protected PDF.',
      'Enter the valid password when prompted.',
      'Click "Unlock PDF" to remove encryption layers.',
      'Download your freely accessible PDF file.',
    ],
    features: [
      'Removes standard AES-256 and RC4 password locks',
      'Eliminates printing and editing restrictions',
      'Instant decryption upon supplying the authorized password',
    ],
    supportedFormats: {
      input: ['Protected PDF (.pdf)'],
      output: ['Unlocked PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Decrypted documents are processed strictly in memory and deleted within 60 minutes.',
    faqs: [
      {
        question: 'Do I need the password to unlock the PDF?',
        answer:
          'Yes. In accordance with security standards, you must provide the authorized password to decrypt the file.',
      },
    ],
    relatedTools: ['protect-pdf', 'watermark-pdf', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'ocr-pdf': {
    slug: 'ocr-pdf',
    title: 'OCR PDF Online — Make Scanned PDFs Searchable Free | fileconvr',
    metaDescription:
      'Optical Character Recognition (OCR) for PDF documents. Convert scanned physical documents into searchable, selectable, and copyable text files.',
    h1: 'OCR PDF — Make Scanned Documents Searchable',
    intro:
      'Extract text from scanned PDFs and image-only documents using advanced OCR technology. Turn static page images into selectable, copyable, and indexed text.',
    howToSteps: [
      'Upload the scanned PDF document.',
      'Select recognition language (default: English).',
      'Click "Run OCR" to detect glyphs and align text layers.',
      'Download your searchable PDF with an invisible selectable text layer.',
    ],
    features: [
      'High-accuracy Tesseract OCR engine integration',
      'Preserves original scan image visual fidelity with an aligned text layer',
      'Enables full-text searching (Ctrl+F) and text copying',
      'Supports multi-page scanned documents',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['Searchable PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Scanned documents and OCR text representations are processed ephemerally and automatically purged within 60 minutes.',
    faqs: [
      {
        question: 'How does OCR make a PDF searchable?',
        answer:
          'OCR recognizes character glyphs in the page imagery and overlays an invisible, selectable text layer directly over the original scan, enabling searching and copying while preserving appearance.',
      },
    ],
    relatedTools: ['repair-pdf', 'pdf-to-word', 'compress-pdf'],
    softwareType: 'DocumentUtility',
  },

  'repair-pdf': {
    slug: 'repair-pdf',
    title: 'Repair Corrupted PDF Online — Fix Damaged PDF Files | fileconvr',
    metaDescription:
      'Recover damaged, unreadable, or corrupted PDF files online. Reconstruct broken cross-reference tables, xref streams, and missing EOF trailers.',
    h1: 'Repair Damaged & Corrupted PDF Files',
    intro:
      'Rescue corrupt documents that fail to open in Adobe Acrobat or web browsers. Automatically rebuild broken cross-reference tables (XREF), reconstruct object trees, and restore missing trailers.',
    howToSteps: [
      'Upload the damaged or corrupted PDF file.',
      'Click "Repair PDF" to execute structural recovery heuristics.',
      'Inspect the recovery status and repair report.',
      'Download your recovered PDF document.',
    ],
    features: [
      'Cross-reference table (XREF) rebuild and stream recovery',
      'Object dictionary recovery and trailer synthesis',
      'Recovers readable pages from partially truncated files',
      'Automatic validation of rendering fidelity post-repair',
    ],
    supportedFormats: {
      input: ['Corrupted PDF (.pdf)'],
      output: ['Repaired PDF (.pdf)'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Files submitted for repair are isolated in memory and purged within 60 minutes.',
    faqs: [
      {
        question: 'Can all damaged PDF files be repaired?',
        answer:
          'Most structural errors (damaged xref tables, missing EOF markers, corrupted stream lengths) are fully repairable. Severely wiped or zero-byte files cannot be recovered.',
      },
    ],
    relatedTools: ['ocr-pdf', 'compress-pdf', 'merge-pdf'],
    softwareType: 'DocumentUtility',
  },

  'compare-pdf': {
    slug: 'compare-pdf',
    title: 'Compare PDF Files Online — Diff Two PDFs Side-by-Side | fileconvr',
    metaDescription:
      'Compare two PDF documents side-by-side online. Detect text changes, additions, deletions, and page discrepancies with visual side-by-side diffing.',
    h1: 'Compare Two PDF Documents Side-by-Side',
    intro:
      'Spot changes between document revisions, contract versions, and reports in seconds. Highlights added, removed, and modified text with exact line-by-line diffing.',
    howToSteps: [
      'Upload the original PDF (Version A) and the revised PDF (Version B).',
      'Click "Compare Documents" to initiate structural and textual diffing.',
      'View the similarity percentage, page count differences, and highlighted text diffs.',
      'Download or review the comprehensive comparison report.',
    ],
    features: [
      'Side-by-side dual document viewer',
      'Similarity percentage calculation',
      'Color-coded additions (green) and deletions (red)',
      'Identifies added, deleted, or reordered pages',
    ],
    supportedFormats: {
      input: ['Two PDF files (.pdf)'],
      output: ['Comparison analysis report'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Both comparison documents are held in memory only for the duration of the diff calculation and purged within 60 minutes.',
    faqs: [
      {
        question: 'Can I compare contracts with different numbers of pages?',
        answer:
          'Yes. The comparison engine aligns text across mismatched page counts and flags removed or inserted pages.',
      },
    ],
    relatedTools: ['summarize-pdf', 'ocr-pdf', 'merge-pdf'],
    softwareType: 'DocumentUtility',
  },

  'summarize-pdf': {
    slug: 'summarize-pdf',
    title: 'AI PDF Summarizer — Summarize & Ask Questions to PDF | fileconvr',
    metaDescription:
      'AI-powered PDF summarizer. Generate concise document executive summaries, key takeaways with exact page citations, and ask contextual questions.',
    h1: 'AI PDF Summarizer & Contextual Q&A',
    intro:
      'Extract key insights from long reports, research papers, legal briefs, and textbooks in seconds. Ask specific questions and receive verified answers with page citations.',
    howToSteps: [
      'Upload your PDF document.',
      'Receive an instant executive summary and bulleted key takeaways.',
      'Ask specific questions about the document in the interactive Q&A box.',
      'Review answers accompanied by exact page citation references.',
    ],
    features: [
      'Executive summaries and structured bullet takeaways',
      'Contextual Q&A with direct page citation references',
      'Defends against prompt-injection attacks inside PDF contents',
      'Automatic fallback recommendation to OCR for scanned documents',
    ],
    supportedFormats: {
      input: ['PDF (.pdf)'],
      output: ['Summary report & Q&A responses'],
      maxSizeMB: 100,
    },
    privacyNotice:
      'Document text submitted for AI summarization is processed strictly in-session and never stored or used to train public models.',
    faqs: [
      {
        question: 'Does the AI summarizer work on scanned physical papers?',
        answer:
          'If your PDF contains scanned imagery without a text layer, the tool will recommend running our free OCR PDF tool first to extract the text.',
      },
    ],
    relatedTools: ['ocr-pdf', 'compare-pdf', 'pdf-to-word'],
    softwareType: 'DocumentUtility',
  },
};
