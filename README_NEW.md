# AI Mock Interview Coach

An intelligent, AI-powered mock interview platform that uses Claude AI to generate personalized interview questions, evaluate responses in real-time, and provide detailed feedback to help you ace your interviews.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

## Features

✨ **Smart Question Generation**
- AI-powered questions based on job role and experience level
- Customizable difficulty levels (Fresher, Mid-level, Senior)
- Multiple question types (Technical, HR, Mixed)

🎤 **Real-Time Feedback**
- Voice input support for natural practice
- Instant evaluation of your answers
- Detailed performance metrics (Clarity, Depth, Communication)

📊 **Comprehensive Analysis**
- Overall scoring system (1-10)
- Strength identification and improvement suggestions
- Ideal answer hints for better learning

💾 **Session Tracking**
- Save interview sessions for later review
- Track progress over time
- View performance metrics per question

🎨 **Professional UI**
- Modern, responsive design
- Dark theme optimized for focus
- Intuitive user experience

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client

### Backend
- **FastAPI** - Python web framework
- **Claude API** - AI integration
- **SQLite** - Database
- **Python 3.10+**

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git
- Anthropic API key (get at https://console.anthropic.com)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-interview-coach.git
cd ai-interview-coach
```

2. **Setup Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
# Server runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5174
```

Open http://localhost:5174 in your browser and start practicing!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/get-question` | Generate interview question |
| POST | `/evaluate` | Evaluate candidate's answer |
| POST | `/save-session` | Save interview session |
| GET | `/history/{name}` | Get session history |

## Project Structure

```
ai-interview-coach/
├── frontend/                 # React Vite app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app component
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.js
├── backend/                  # FastAPI server
│   ├── main.py              # API endpoints
│   ├── claude.py            # Claude integration
│   ├── database.py          # Database operations
│   └── requirements.txt
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD workflow
├── DEPLOYMENT.md            # Deployment guide
└── README.md               # This file
```

## Deployment

### Quick Deploy

With GitHub Actions, auto-deployment is enabled:

1. **Push to GitHub:**
```bash
git push origin main
```

2. **CI/CD automatically:**
   - Runs tests
   - Builds frontend
   - Deploys to Vercel
   - Deploys to Render

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions:
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** PostgreSQL (optional)

## Environment Variables

### Backend (.env)
```env
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
DATABASE_URL=sqlite:///./interview.db
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Configuration

### Question Generation
Modify `backend/claude.py` to customize:
- Question difficulty
- Question types
- Evaluation criteria

### UI Customization
Edit `frontend/src/index.css` for:
- Color scheme
- Typography
- Spacing

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

- 📖 [Full Documentation](./DEPLOYMENT.md)
- 🐛 [Report Issues](https://github.com/YOUR_USERNAME/ai-interview-coach/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/ai-interview-coach/discussions)

## Roadmap

- [ ] User authentication & profiles
- [ ] Advanced analytics dashboard
- [ ] Video recording of practice sessions
- [ ] Export reports as PDF
- [ ] Interview tips & resources
- [ ] Peer comparison & rankings
- [ ] More AI models (GPT-4, etc.)
- [ ] Mobile app

## Acknowledgments

- [Anthropic Claude](https://anthropic.com) for AI capabilities
- [FastAPI](https://fastapi.tiangolo.com) for the backend framework
- [React](https://react.dev) and [Tailwind CSS](https://tailwindcss.com) for frontend
- [Vercel](https://vercel.com) and [Render](https://render.com) for hosting

---

**Made with ❤️ for interview preparation**

