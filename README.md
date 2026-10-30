# fileconvr — Full-Stack PDF Platform

**fileconvr** is a high-performance, modern, privacy-first PDF utility platform inspired by leading document productivity workflows. It provides an intuitive suite of document transformation tools engineered with memory sandboxing, zero document retention, and real processing metrics.

---

## Architecture & Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript and Vite
- **Styling**: Tailwind CSS v4 with custom glassmorphism and modern dark design tokens
- **Typography**: Google Fonts (*Outfit* & *Plus Jakarta Sans*)
- **Icons**: Lucide React
- **Page Previews**: PDF.js (`pdfjs-dist`) for interactive canvas thumbnail generation
- **API Client**: Fetch-based client with error interceptors and live health monitoring

### Backend
- **Runtime**: Node.js v20+ (tested on Node.js v24.22.1 on Windows x64)
- **Framework**: Express with TypeScript
- **Document Processing**:
  - `pdf-lib`: Object stream manipulation, document merging, page splitting, rotation, organize operations, watermarking, and metadata sanitization.
  - `PyMuPDF` (Python 3.14): Industry-standard AES-256 PDF encryption, authenticated decryption, and rotation-invariant visual page numbering.
  - `sharp`: Ultra-fast libvips-backed raster image processing, downsampling, and JPEG re-encoding.
  - `pdf-to-img` & `pdfjs-dist`: High-resolution PDF page rasterization into JPEG images without native C++ compilation bindings.
  - `mammoth`, `xlsx`, `adm-zip`: Multi-format Office document conversions for Word, Excel, and PowerPoint.
  - `archiver`: High-efficiency streaming ZIP packaging for multi-page extractions and conversions.
- **Validation**: Zod schema validation & PDF magic byte verification (`%PDF-`).
- **Testing**: Vitest integration test suite testing all endpoints against real documents.

---

## Milestone 1 Implemented Features (Core Foundation)

1. **Merge PDF**: Multi-file drag-and-drop, interactive card reordering, alphabetical sorting (`A-Z`), per-card deletion, and instant single PDF download.
2. **Split PDF**: Single file upload with custom range expressions (e.g. `1-3, 5, 8-10`), with option to merge extracted pages into 1 PDF or download as individual PDFs inside a ZIP archive.
3. **Compress PDF**: Real 3-tier processing engine (`extreme`, `recommended`, `low`) downsampling embedded JPEG rasters and compacting cross-reference object streams. Honestly computes and displays before/after file sizes and percentage saved.
4. **Rotate PDF**: Permanent orientation modifications by 90° clockwise, 180° flip, or 270° counter-clockwise, with target selection (All pages, Portrait only, Landscape only).
5. **JPG/PNG to PDF**: Convert raster images (JPG, PNG, WebP) into formatted PDFs with custom page dimensions (`Fit`, `A4`, `Letter`), orientation, and margin settings.
6. **PDF to JPG**: Render PDF pages into high-resolution JPG images. Outputs single `.jpg` for 1-page documents and `.zip` archive for multi-page documents.
7. **Platform Directory & Search**: Live searchable tool directory with category filters (*Organize*, *Optimize*, *Convert*, *Edit*, *Security*).
8. **Health Check API**: Endpoint at `/api/health` reporting live service status and active engine feature flags.

---

## Milestone 2 Implemented Features (Office & Document Conversions)

1. **Word to PDF (`/word-to-pdf`)**: Converts `.docx` (and `.doc`) documents into vector PDFs preserving headings, typography, tables, bullet points, and embedded images.
2. **Excel to PDF (`/excel-to-pdf`)**: Converts multi-sheet `.xlsx` and `.xls` workbooks into clean tabular PDFs with automatic landscape orientation detection for wide sheets, preserving sheet order without dropping rows or columns.
3. **PowerPoint to PDF (`/ppt-to-pdf`)**: Converts `.pptx` presentations into 16:9 widescreen landscape vector PDFs, mapping each slide 1-to-1 to PDF pages and preserving slide titles and bullet hierarchy.
4. **PDF to Word (`/pdf-to-word`)**: Reconstructs editable Microsoft Word `.docx` documents from native PDF text streams, paragraph flows, and table structures using PyMuPDF and `pdf2docx`. Identifies scanned documents and reports when OCR is required.

---

## Milestone 3 Implemented Features (PDF Editing and Security)

1. **Organize PDF (`/organize-pdf`)**:
   - Interactive client-side canvas thumbnails powered by PDF.js.
   - Accessible reordering controls (Move Left/Right, Drag-and-drop).
   - Per-page rotation (90° clockwise or counterclockwise).
   - Duplicate page cards.
   - Single and multi-page selection with Select All / Clear Selection.
   - Safe deletion with guard preventing empty documents (warnings on removing all pages).
   - Rebuilding page sequence and preserving content and rotation on the backend.
2. **Watermark PDF (`/watermark-pdf`)**:
   - **Text Watermark**: Custom text input, font size (12–120pt), hex color picker, opacity slider (5–100%), rotation angle (-180° to +180°), 9-point grid alignment, layer placement (Above content vs Background layer), and page range targeting (`all`, `odd`, `even`, or custom ranges).
   - **Image Watermark**: Accepts PNG and JPEG logo images with transparency preservation, custom scale, opacity slider, rotation, and 9-point alignment.
   - Interactive live document preview simulation card.
3. **Add Page Numbers (`/page-numbers-pdf`)**:
   - 6 standard positions (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right).
   - Configurable format presets (`Page 1 of N`, `Page 1`, or raw numbers `1, 2, 3...`).
   - Starting number offset, custom prefix and suffix.
   - Font size and color selection.
   - Margin adjustments from 10pt to 60pt.
   - Page range targeting and optional first-page exclusion (title/cover page).
   - Visual simulation viewport.
4. **Protect PDF (`/protect-pdf`)**:
   - Real standard AES-256 password encryption via PyMuPDF.
   - Real-time honest password strength indicator (Weak, Moderate, Strong).
   - Show/hide password toggles and password confirmation verification.
   - Strict in-memory credential sanitization; passwords are piped via stdin to subprocesses and never appear in process listings or logs.
   - Document verification upon encryption to confirm password requirement.
5. **Unlock PDF (`/unlock-pdf`)**:
   - Authenticated password decryption for authorized document owners.
   - Distinct error reporting for incorrect passwords (`INCORRECT_PASSWORD`).
   - Verification that decrypted document opens freely without passwords.

---

## Architectural & Security Decisions

- **Storage & Lifecycle**: All uploaded and generated files are isolated inside cryptographically unique task directories (`./storage/temp/${taskId}/`). A background sweeping cron runs every 15 minutes to delete directories exceeding the TTL threshold (60 minutes default).
- **Password Safety**: Sensitive passwords are never stored in databases, logs, task metadata, or temporary files. Passwords are sent via stdin JSON pipes to prevent exposure in operating system process listings (`Get-Process`/`ps`).
- **Input Validation**: All operation parameters and page ranges are validated server-side with Zod schemas. Uploaded files are verified via magic byte inspection (`%PDF-`).
- **Deferral of Database & Redis**: In accordance with user guidance, PostgreSQL and Redis are deferred until Milestone 4 (User Authentication, Persistent Job History, and Tier Quotas). The current in-memory task dispatcher and disk scratch architecture provides zero external infrastructure overhead while preserving exact boundary interfaces for future Prisma ORM integration.

---

## Getting Started (Windows PowerShell)

### Prerequisites
- Node.js v20+ and npm v10+
- Python 3.10+ (tested with Python 3.14 on Windows x64 with `pymupdf` installed)

### Installation
From the root workspace directory, install dependencies for both the backend and frontend:

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Environment Configuration
Copy `.env.example` to `.env` in the `backend/` directory:

```powershell
cp backend/.env.example backend/.env
```

Default configuration variables:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
TEMP_STORAGE_DIR=./storage/temp
FILE_TTL_MINUTES=60
MAX_FILE_SIZE_BYTES=104857600
NODE_ENV=development
PYTHON_PATH=python
```

### Running the Application

You can run the backend and frontend concurrently in two PowerShell terminals:

#### Terminal 1 — Start the Backend Server:
```powershell
cd backend
npm run dev
```
*Backend runs at:* `http://localhost:5000`  
*Health Check:* `http://localhost:5000/api/health`

#### Terminal 2 — Start the Frontend Dev Server:
```powershell
cd frontend
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## Running the Automated Test Suite

The backend includes a comprehensive Vitest regression suite verifying all Milestone 1, 2, and 3 tools, input validation, and security guards against real test documents:

```powershell
cd backend
npm test
```

### Verified Test Results (37 of 37 Passed):
- `tests/health.test.ts`:
  - `GET /api/health`: Health check endpoint returns 200 with service information and all 15 feature flags.
- `tests/pdf-tools.test.ts` (Milestone 1 — 10 tests):
  - `POST /api/pdf/merge`: Merges multiple PDFs and delivers valid downloadable document.
  - `POST /api/pdf/merge`: Rejects requests with fewer than 2 files with 400.
  - `POST /api/pdf/split`: Correctly parses custom ranges (`1-2, 4`) and validates output page count.
  - `POST /api/pdf/split`: Rejects page ranges exceeding total document pages.
  - `POST /api/pdf/rotate`: Applies 90° rotation and verifies `/Rotate` dictionary tags.
  - `POST /api/pdf/compress`: Executes stream and raster optimization, honestly reporting savings.
  - `POST /api/pdf/img-to-pdf`: Converts images into valid A4 PDF documents.
  - `POST /api/pdf/pdf-to-img`: Rasterizes PDF pages into crisp JPEGs.
---

## Milestone 4 Implemented Features (Authentication, Dashboard, History, and Quotas)

1. **PostgreSQL & Prisma Schema**:
   - `User`: Unique UUID, normalized lowercase email, salted bcrypt password hash (12 rounds), status, role, tier, timestamps.
   - `Session`: Cryptographically random 32-byte session token hashed with SHA-256, expiration dates, IP address, user agent, and revocation timestamps.
   - `ProcessingJob`: Persistent record tracking tool type, input/output filenames, file sizes, page counts, taskId, status (`PROCESSING`, `COMPLETED`, `FAILED`), error details, and expiration TTL.
   - `UsageRecord`: Granular audit log of operations, processed byte sizes, and timestamps for both registered users and anonymous visitors.
   - `Subscription`: Prepared schema for future subscription integration with tier limits, billing periods, and status.
   - Generated initial PostgreSQL migration DDL at `backend/prisma/migrations/20261029000000_init/migration.sql`.
2. **Secure Authentication & Session Management**:
   - `POST /api/auth/register`: Validates email, password strength (minimum 8 characters), and password confirmation. Prevents duplicate email registration.
   - `POST /api/auth/login`: Authenticates credentials with generic safe error responses (`INVALID_CREDENTIALS`). Rate-limited to prevent brute-force abuse.
   - `POST /api/auth/logout`: Revokes active server-side session and clears the authentication cookie.
   - `GET /api/auth/me`: Authenticates active session token and returns the current user profile.
   - Zero localStorage token exposure: sessions managed exclusively via secure, `HttpOnly`, `SameSite: 'lax'` cookies.
3. **User Dashboard & Metrics UI (`/dashboard`)**:
   - Real-time personal quota meters displaying daily operations used / remaining, single-file limit, batch limit, and total processed bytes.
   - Quick launch directory for all 8 core conversion and editing tools.
   - Persistent Processing History table with document status badges, real file availability verification on disk, direct download actions, and record deletion.
   - Informative empty state for new accounts with quick CTA.
4. **Server-Enforced Quota Engine**:
   - Enforces configurable limits per tier (*Anonymous*, *Registered Free*, and *Premium Prepared*):
     - Maximum single file size (25 MB anonymous / 100 MB free)
     - Maximum total batch input size (50 MB anonymous / 200 MB free)
     - Maximum files per operation (5 anonymous / 25 free)
     - Maximum daily operations count (25 anonymous / 60 free)
     - Maximum concurrent jobs (2 anonymous / 3 free)
     - File retention TTL (30 min anonymous / 60 min free)
   - Failed operations do not consume quota.
   - Concurrency limits automatically release when jobs finish or fail.
5. **Private File Authorization & Retention**:
   - Downloads check job ownership: authenticated user files cannot be downloaded by another user or anonymous visitors (returns `403 FORBIDDEN`).
   - Downloads check file expiration (`410 FILE_EXPIRED`) and disk existence (`404 NOT_FOUND`).

## Milestone 5 Implemented Features (Advanced PDF and AI Features)

1. **Feature A — OCR PDF (`/api/pdf/ocr`)**:
   - Accepts valid scanned or image-based PDF documents.
   - Detects pages with little or no extractable text (< 30 characters).
   - Multi-lingual optical character recognition powered by self-contained `tesseract.js` engine supporting 12+ languages (`eng`, `spa`, `fra`, `deu`, `ita`, `por`, `nld`, `chi_sim`, `rus`, `jpn`, `ara`, `hin`).
   - Produces a searchable PDF with invisible text overlays (`render_mode=3` in PDF specification) accurately scaled to page coordinates, preserving original page dimensions, images, and formatting.
   - Provides live extracted text preview panel with one-click copy and word count statistics.
   - Reports missing dependencies and unsupported languages clearly.
   - Honest accuracy limitations notice regarding font skew, contrast, and scan resolution.

2. **Feature B — Repair PDF (`/api/pdf/repair`)**:
   - Best-effort recovery and repair of damaged or corrupted PDF documents.
   - Low-level indirect object stream scanner and cross-reference (`xref`) table reconstructor.
   - Reconstructs corrupted document trailers, catalog roots, and object dictionaries.
   - Validates repaired documents with a secondary parser (`pdf-lib`) and verifies page renderability before returning success.
   - Strictly preserves the original uploaded file; saves repaired output to a separate sanitized file.
   - Rejects unrecoverable or severely truncated non-PDF files with `422 UNRECOVERABLE_PDF`.
   - Never makes false guarantees that every corrupted file can be repaired.

3. **Feature C — Compare PDF (`/api/pdf/compare`)**:
   - Two-file comparison accepting baseline (`file1`) and revised (`file2`) documents up to 50 pages and 25MB each.
   - **Textual Comparison**:
     - Extracts per-page text and computes line-by-line sequence diffs (`added`, `removed`, `unchanged`).
     - Calculates text similarity scores and tracks added/removed line totals.
     - Page-oriented text difference viewer with line numbers and color-coded change highlights.
   - **Visual Comparison**:
     - Rasterizes corresponding pages at 150 DPI.
     - Computes pixel-level difference masks using Pillow `ImageChops.difference`.
     - Highlights visual raster shifts in high-contrast red overlays and computes exact changed pixel percentage.
     - Handles documents with differing page counts and dimension mismatches.
     - Generates structured JSON comparison reports available for download.
   - Clear disclaimer explaining font rasterization, anti-aliasing, and layout variations.

4. **Feature D — AI PDF Summarizer & Q&A (`/api/pdf/summarize` & `/api/pdf/ask`)**:
   - Extracts page-annotated text streams (`[Page X]`) from PDF documents.
   - Detects scanned documents (< 50 characters of text) and provides a prominent prompt to run OCR PDF.
   - **Document Summaries**: Supports `concise`, `standard`, and `detailed` granularities, providing Executive Summary, Key Insights, and Action Items.
   - **Document Q&A**: Answers user questions strictly based on document text with exact `[Page X]` citations.
   - **Prompt-Injection Defense**: Treats document content as untrusted plain data delimited by strict XML boundaries (`<DOCUMENT_CONTENT>`), with rigid system rules forbidding execution of internal document overrides.
   - **Context Window Management & Chunking**: Splits large documents into 24,000-character page-aligned chunks and performs map-reduce synthesis.
   - **Zero Credential Exposure**: Never reveals API keys in responses, headers, or logs.
   - **Provider Availability**: Reports `503 AI_PROVIDER_NOT_CONFIGURED` when no API keys are present in backend environment, without returning fake or hardcoded answers.

---

## Automated Test Suite (77 Passing Tests)

Run the automated regression test suite across all 5 milestones:

```powershell
cd backend
npm test
```

### Complete Test Breakdown by Suite (6 test files):
1. `tests/health.test.ts` (1 test): Engine health check and feature flag verification.
2. `tests/pdf-tools.test.ts` (10 tests — Milestone 1): Merge, Split, Rotate, Compress, Image to PDF, PDF to Image, validation, download security.
3. `tests/office-conversions.test.ts` (7 tests — Milestone 2): Word to PDF, Excel to PDF, PowerPoint to PDF, PDF to Word, file validation.
4. `tests/pdf-editing-security.test.ts` (19 tests — Milestone 3): Organize PDF, Text & Image Watermarking, Page Numbers, AES-256 Protection, Unlocking, error handling.
5. `tests/auth-quota-history.test.ts` (22 tests — Milestone 4):
   - Successful registration & HTTP-only session cookie
   - Duplicate email rejection (`EMAIL_EXISTS`)
   - Invalid email format rejection (`VALIDATION_ERROR`)
   - Weak password rejection (< 8 characters)
   - Mismatched password confirmation rejection
   - Successful login & session generation
   - Safe error handling for incorrect credentials
   - Non-existent user rejection
   - Session verification via `/api/auth/me`
   - Session revocation & cookie clearance via `/api/auth/logout`
   - Route protection for `/api/dashboard`, `/api/jobs`, and `/api/usage` (401 Unauthorized)
   - Automatic persistent job creation upon operation completion
   - Job detail access authorization (Owner 200 OK vs other user 403 Forbidden)
   - Download authorization enforcement (Owner 200 OK vs other user / anonymous 403 Forbidden)
   - User dashboard real metrics and history retrieval
   - History record deletion with ownership validation
   - Quota enforcement: file count rejection (`FILE_COUNT_EXCEEDED`)
   - Quota enforcement: batch size rejection (`UPLOAD_SIZE_EXCEEDED`)
   - Quota enforcement: daily operations quota exhaustion (`DAILY_QUOTA_EXHAUSTED`)
   - Anonymous tool operations working seamlessly within anonymous limits
6. `tests/advanced-ai-tools.test.ts` (18 tests — Milestone 5):
   - **OCR**: Searchable PDF processing, layout preservation, unsupported language rejection, missing engine 503 handling, invalid PDF rejection.
   - **Repair**: Valid PDF verification, recoverable xref corruption repair, severe corruption 422 rejection, original file preservation.
   - **Compare**: Identical document 100% similarity detection, text diff addition/removal identification, added/removed page handling, missing second file rejection.
   - **AI Summarizer & Q&A**: Unconfigured provider 503 check, empty/scanned document detection, successful summarization with page citations, prompt injection defense, Q&A citation answering, missing question rejection, zero API credential exposure.

---

## Production Build & Local Development

### Windows PowerShell Setup:

```powershell
# 1. Install dependencies
cd backend
npm install --no-workspaces
cd ../frontend
npm install

# 2. Database & Prisma Setup
cd ../backend
npx prisma generate

# 3. Run Backend Server (Port 5000)
npx tsx src/server.ts

# 4. In a second terminal, Run Frontend (Port 5173)
cd frontend
npx vite --port 5173

# 5. Production Build Verification
cd ../backend
npm run build

cd ../frontend
npm run build
```

---

## Database Configuration & Persistence

- **Development & Testing Mode**: When `DATABASE_URL` is unconfigured, the application runs an explicitly identified transient in-memory database engine for local development and integration testing.
- **Production Mode**: In production (`NODE_ENV=production`), silent fallback is explicitly disabled. A valid PostgreSQL connection string must be supplied in `DATABASE_URL` (e.g. `postgresql://user:password@localhost:5432/fileconvr?schema=public`).
- **Inspection**: The database state can be inspected via `getDatabaseStatus()` in `src/db/index.ts`.


