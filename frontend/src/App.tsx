import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SeoHead } from './components/SeoHead';
import { TOOLS_SEO_DATA, SITE_CONFIG } from './data/seoData';

// Pages
import { HomePage } from './pages/HomePage';
import { MergePage } from './pages/MergePage';
import { SplitPage } from './pages/SplitPage';
import { CompressPage } from './pages/CompressPage';
import { RotatePage } from './pages/RotatePage';
import { ImgToPdfPage } from './pages/ImgToPdfPage';
import { PdfToImgPage } from './pages/PdfToImgPage';
import { WordToPdfPage } from './pages/WordToPdfPage';
import { ExcelToPdfPage } from './pages/ExcelToPdfPage';
import { PptToPdfPage } from './pages/PptToPdfPage';
import { PdfToWordPage } from './pages/PdfToWordPage';
import { OrganizePage } from './pages/OrganizePage';
import { WatermarkPage } from './pages/WatermarkPage';
import { PageNumbersPage } from './pages/PageNumbersPage';
import { ProtectPage } from './pages/ProtectPage';
import { UnlockPage } from './pages/UnlockPage';
import { OcrPage } from './pages/OcrPage';
import { RepairPage } from './pages/RepairPage';
import { ComparePage } from './pages/ComparePage';
import { SummarizePage } from './pages/SummarizePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { DashboardPage } from './pages/DashboardPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { NotFoundPage } from './pages/NotFoundPage';

const ROUTE_MAP: Record<string, string | null> = {
  '/': null,
  '/merge-pdf': 'merge-pdf',
  '/split-pdf': 'split-pdf',
  '/compress-pdf': 'compress-pdf',
  '/rotate-pdf': 'rotate-pdf',
  '/page-numbers-pdf': 'page-numbers-pdf',
  '/watermark-pdf': 'watermark-pdf',
  '/organize-pdf': 'organize-pdf',
  '/img-to-pdf': 'img-to-pdf',
  '/jpg-to-pdf': 'img-to-pdf',
  '/pdf-to-img': 'pdf-to-img',
  '/pdf-to-jpg': 'pdf-to-img',
  '/word-to-pdf': 'word-to-pdf',
  '/excel-to-pdf': 'excel-to-pdf',
  '/ppt-to-pdf': 'ppt-to-pdf',
  '/pdf-to-word': 'pdf-to-word',
  '/protect-pdf': 'protect-pdf',
  '/unlock-pdf': 'unlock-pdf',
  '/ocr-pdf': 'ocr-pdf',
  '/repair-pdf': 'repair-pdf',
  '/compare-pdf': 'compare-pdf',
  '/summarize-pdf': 'summarize-pdf',
  '/login': 'login',
  '/register': 'register',
  '/account': 'account',
  '/dashboard': 'dashboard',
  '/auth/callback': 'oauth-callback',
};

function getToolFromPath(pathname: string): string | null {
  const clean = pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (clean in ROUTE_MAP) {
    return ROUTE_MAP[clean];
  }
  return 'not-found';
}

function getInitialTool(): string | null {
  if (typeof window === 'undefined') return null;

  if (
    window.location.pathname.includes('/auth/callback') ||
    window.location.hash.includes('access_token=') ||
    window.location.search.includes('code=')
  ) {
    return 'oauth-callback';
  }

  return getToolFromPath(window.location.pathname);
}

function AppContent() {
  const [activeTool, setActiveTool] = useState<string | null>(getInitialTool);
  const { isAuthenticated } = useAuth();

  // Listen for browser Back/Forward (popstate) navigation
  useEffect(() => {
    const handlePopState = () => {
      const tool = getToolFromPath(window.location.pathname);
      setActiveTool(tool);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTool = (toolId: string | null) => {
    let resolvedTool = toolId;

    // Protected routes check
    if ((toolId === 'dashboard' || toolId === 'account') && !isAuthenticated) {
      resolvedTool = 'login';
    }

    setActiveTool(resolvedTool);

    // Update browser URL via HTML5 History API
    let newPath = '/';
    if (resolvedTool === 'login') newPath = '/login';
    else if (resolvedTool === 'register') newPath = '/register';
    else if (resolvedTool === 'dashboard') newPath = '/dashboard';
    else if (resolvedTool === 'account') newPath = '/account';
    else if (resolvedTool === 'oauth-callback') newPath = '/auth/callback';
    else if (resolvedTool === 'not-found') newPath = '/404';
    else if (resolvedTool) newPath = `/${resolvedTool}`;

    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    handleSelectTool(null);
  };

  // Get current SEO metadata
  const currentToolContent = activeTool ? TOOLS_SEO_DATA[activeTool] : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-500/30 selection:text-red-200">
      {/* Route-level Dynamic SEO Head */}
      {activeTool === null && (
        <SeoHead
          title={SITE_CONFIG.defaultTitle}
          description={SITE_CONFIG.defaultDescription}
          canonicalPath="/"
        />
      )}

      {currentToolContent && (
        <SeoHead
          title={currentToolContent.title}
          description={currentToolContent.metaDescription}
          canonicalPath={`/${currentToolContent.slug}`}
          toolContent={currentToolContent}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: currentToolContent.h1, path: `/${currentToolContent.slug}` },
          ]}
        />
      )}

      {activeTool === 'login' && (
        <SeoHead
          title="Sign In to fileconvr — Account Dashboard"
          description="Log in to access your fileconvr account, view document processing history, and manage quotas."
          canonicalPath="/login"
          noindex={true}
        />
      )}

      {activeTool === 'register' && (
        <SeoHead
          title="Create a Free fileconvr Account — Document Utility Platform"
          description="Create your free fileconvr account to unlock higher quotas, manage document jobs, and track conversion history."
          canonicalPath="/register"
          noindex={true}
        />
      )}

      {(activeTool === 'dashboard' || activeTool === 'account' || activeTool === 'oauth-callback') && (
        <SeoHead
          title="User Account & Processing Dashboard | fileconvr"
          description="Manage your active documents, view past conversion history, and customize account settings."
          canonicalPath={`/${activeTool}`}
          noindex={true}
        />
      )}

      {/* Top Header */}
      <Header activeTool={activeTool} onSelectTool={handleSelectTool} />

      {/* Main View Router */}
      <main className="flex-1">
        {/* 404 Route */}
        {activeTool === 'not-found' && (
          <NotFoundPage
            onNavigateHome={handleBackToHome}
            onSelectTool={handleSelectTool}
          />
        )}

        {/* OAuth Callback handler */}
        {activeTool === 'oauth-callback' && (
          <OAuthCallbackPage
            onSuccess={() => {
              if (window.history.replaceState) {
                window.history.replaceState(null, '', '/');
              }
              handleSelectTool('dashboard');
            }}
            onNavigateToLogin={() => {
              if (window.history.replaceState) {
                window.history.replaceState(null, '', '/');
              }
              handleSelectTool('login');
            }}
          />
        )}

        {/* Auth & Dashboard Views */}
        {activeTool === 'login' && (
          <LoginPage
            onNavigateToRegister={() => handleSelectTool('register')}
            onSuccess={() => handleSelectTool('dashboard')}
          />
        )}
        {activeTool === 'register' && (
          <RegisterPage
            onNavigateToLogin={() => handleSelectTool('login')}
            onSuccess={() => handleSelectTool('dashboard')}
          />
        )}
        {activeTool === 'dashboard' && (
          isAuthenticated ? (
            <DashboardPage
              onSelectTool={handleSelectTool}
              onNavigateToAccount={() => handleSelectTool('account')}
            />
          ) : (
            <LoginPage
              onNavigateToRegister={() => handleSelectTool('register')}
              onSuccess={() => handleSelectTool('dashboard')}
            />
          )
        )}
        {activeTool === 'account' && (
          isAuthenticated ? (
            <AccountPage
              onNavigateToDashboard={() => handleSelectTool('dashboard')}
              onLogoutSuccess={() => handleSelectTool(null)}
            />
          ) : (
            <LoginPage
              onNavigateToRegister={() => handleSelectTool('register')}
              onSuccess={() => handleSelectTool('dashboard')}
            />
          )
        )}

        {/* Core & Conversion Tools */}
        {activeTool === null && <HomePage onSelectTool={handleSelectTool} />}
        {activeTool === 'organize-pdf' && <OrganizePage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'merge-pdf' && <MergePage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'split-pdf' && <SplitPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'compress-pdf' && <CompressPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'rotate-pdf' && <RotatePage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'page-numbers-pdf' && <PageNumbersPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'watermark-pdf' && <WatermarkPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'img-to-pdf' && <ImgToPdfPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'pdf-to-img' && <PdfToImgPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'word-to-pdf' && <WordToPdfPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'excel-to-pdf' && <ExcelToPdfPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'ppt-to-pdf' && <PptToPdfPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'pdf-to-word' && <PdfToWordPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'protect-pdf' && <ProtectPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'unlock-pdf' && <UnlockPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'ocr-pdf' && <OcrPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'repair-pdf' && <RepairPage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'compare-pdf' && <ComparePage onBack={handleBackToHome} onSelectTool={handleSelectTool} />}
        {activeTool === 'summarize-pdf' && (
          <SummarizePage
            onBack={handleBackToHome}
            onNavigateToOcr={() => handleSelectTool('ocr-pdf')}
            onSelectTool={handleSelectTool}
          />
        )}
      </main>

      {/* Persistent Footer with Full Semantic Links */}
      <Footer onSelectTool={handleSelectTool} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
