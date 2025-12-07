# Document Tracker Frontend

A Vietnamese-language document comparison tool that detects and classifies changes between two versions of Word documents (.docx).

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 📄 **Upload & Compare** - Upload two .docx files to detect differences
- 🎯 **Impact Classification** - Changes categorized as Critical, Medium, or Low
- 📊 **Summary Dashboard** - Quick overview of all detected changes
- 🔍 **Detailed Analysis** - View original vs. modified text with AI-powered reasoning
- 📥 **Export Results** - Download annotated documents with highlighted changes

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn
- Backend API running (configure via `VITE_API_URL`)

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd doc-tracker-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
```

Replace the URL with your backend API endpoint.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click **"Add New Project"**
   - Import your repository

3. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**
   - In the project settings, go to **Environment Variables**
   - Add: `VITE_API_URL` = `https://your-backend-api.com`

5. **Deploy**
   - Click **"Deploy"**
   - Vercel will automatically build and deploy your app

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Deploy**

```bash
# For preview deployment
vercel

# For production deployment
vercel --prod
```

4. **Set Environment Variables**

```bash
vercel env add VITE_API_URL
```

Enter your backend API URL when prompted (e.g., `https://your-backend-api.com`)

### Automatic Deployments

Once connected to Vercel, every push to your main branch will trigger a production deployment, and pull requests will create preview deployments.

## Project Structure

```
doc-tracker-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## API Requirements

This frontend expects a backend API with the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/compare` | POST | Upload two .docx files for comparison |
| `/api/download/:id` | GET | Download annotated document |

### `/api/compare` Request

```
Content-Type: multipart/form-data

Fields:
- file_v1: Original document (.docx)
- file_v2: Modified document (.docx)
- document_type: "contract"
```

### `/api/compare` Response

```json
{
  "summary": {
    "total": 5,
    "critical": 1,
    "medium": 2,
    "low": 2
  },
  "changes": [
    {
      "change_id": "1",
      "change_type": "modified",
      "impact": "critical",
      "location": "Section 3.1",
      "original": "Original text",
      "modified": "Modified text",
      "reasoning": "Explanation of the change",
      "risk_analysis": "Risk assessment",
      "classification_source": "ai"
    }
  ],
  "processing_time_ms": 1234,
  "annotated_doc_id": "doc-123"
}
```

## Tech Stack

- **React 19** - UI Framework
- **Vite 7** - Build Tool
- **Axios** - HTTP Client
- **Lucide React** - Icons

## License

MIT License - see [LICENSE](LICENSE) for details.

