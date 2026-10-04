const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../frontend-vite/src');
const destDir = path.join(__dirname, 'src');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function processContent(content) {
  // Replace react-router-dom imports
  let newContent = content.replace(/import\s+\{\s*Link(?:,\s*useLocation|\s*useNavigate)?\s*\}\s+from\s+['"]react-router-dom['"]/g, "import Link from 'next/link'");
  newContent = newContent.replace(/import\s+\{\s*useNavigate\s*\}\s+from\s+['"]react-router-dom['"]/g, "import { useRouter } from 'next/navigation'");
  
  // Replace useNavigate hooks
  newContent = newContent.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, "const router = useRouter()");
  newContent = newContent.replace(/navigate\(/g, "router.push(");
  
  // Replace Link props if any to -> href
  newContent = newContent.replace(/<Link\s+to=/g, "<Link href=");
  
  // Add "use client" if it uses hooks
  if (newContent.includes('useState') || newContent.includes('useRef') || newContent.includes('useRouter') || newContent.includes('useMemo') || newContent.includes('useCallback')) {
    newContent = '"use client";\n' + newContent;
  }
  
  return newContent;
}

const pagesMap = {
  'pages/LandingPage.jsx': 'app/page.jsx',
  'pages/AnalyzePage.jsx': 'app/analyze/page.jsx',
  'pages/ResultsPage.jsx': 'app/results/page.jsx',
  'pages/CandidatePortal.jsx': 'app/candidate/page.jsx',
  'pages/ResumeBuilder.jsx': 'app/candidate/builder/page.jsx',
  'pages/CoverLetterGen.jsx': 'app/candidate/cover-letter/page.jsx',
};

// Layout
const layoutContent = `
import '../app/globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'HirePilot AI',
  description: 'AI Resume & Job Matching System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="page-content">
          {children}
        </div>
      </body>
    </html>
  )
}
`;
ensureDir(path.join(destDir, 'app'));
fs.writeFileSync(path.join(destDir, 'app/layout.jsx'), layoutContent.trim());

// Migrate Pages
for (const [oldPath, newPath] of Object.entries(pagesMap)) {
  const oldFile = path.join(srcDir, oldPath);
  const newFile = path.join(destDir, newPath);
  ensureDir(path.dirname(newFile));
  
  const content = fs.readFileSync(oldFile, 'utf8');
  fs.writeFileSync(newFile, processContent(content));
}

console.log("Migration complete!");
