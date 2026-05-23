# ReWrite AI ✨

A powerful AI-powered text rewriting application that helps you enhance, rephrase, and improve your content. Built with React and Express.js, deployed on Vercel.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?logo=express)](https://expressjs.com)

## 🌟 Features

- **AI-Powered Rewriting**: Intelligently rephrase and enhance text content
- **Multiple Rewrite Modes**: Different styles and tones for various use cases
- **Real-time Processing**: Quick and responsive text transformation
- **User-Friendly Interface**: Clean, intuitive React-based UI
- **Cloud Deployed**: Hosted on Vercel for reliability and scalability

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool and development server
- **JavaScript (ES6+)**

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Deployment
- **Vercel** - Hosting platform for frontend and serverless functions

## 📋 Prerequisites

Before getting started, ensure you have:
- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- An **API key** for the AI service (if applicable)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ReWrite_AI.git
cd ReWrite_AI
```

### 2. Install Dependencies

**For the server:**
```bash
cd server
npm install
```

**For the client:**
```bash
cd client
npm install
```

### 3. Configure Environment Variables

**Server (.env file):**
```bash
cd server
cp .env.example .env
# Edit .env and add your configuration
```

Add required environment variables:
```
PORT=5000
NODE_ENV=development
# Add your API keys and other configurations here
```

**Client (.env.local file):**
```bash
cd client
# Create .env.local and add API endpoint
VITE_API_URL=http://localhost:5000
```

### 4. Run the Application

**Start the backend server:**
```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

**In a new terminal, start the frontend:**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
ReWrite_AI-main/
├── api/                    # API utility functions
│   ├── rewrite.js         # Main rewrite functionality
│   └── score.js           # Content scoring/analysis
├── client/                 # React frontend
│   ├── src/               # Source files
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   └── index.html         # Entry HTML
├── server/                 # Express backend
│   ├── index.js           # Server entry point
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment template
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## 📖 API Documentation

### Endpoints

#### Rewrite Text
```
POST /api/rewrite
Content-Type: application/json

{
  "text": "Your text to rewrite",
  "mode": "formal|casual|creative",
  "tone": "professional|friendly|technical"
}

Response:
{
  "original": "Your text to rewrite",
  "rewritten": "Enhanced text version",
  "suggestions": [...]
}
```

#### Score Content
```
POST /api/score
Content-Type: application/json

{
  "text": "Your content to analyze"
}

Response:
{
  "score": 85,
  "feedback": "Suggestions for improvement",
  "metrics": {...}
}
```

## 🔧 Development

### Available Scripts

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server:**
- `npm run start` - Run production server
- `npm run dev` - Run development server with hot reload (uses nodemon)

### Build for Production

```bash
# Build frontend
cd client
npm run build

# The output will be in client/dist/
```

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Install dependencies
- Build the client with command: `cd client && npm install && npm run build`
- Serve the output from `client/dist/`

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
# Add your API keys here
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
```

### Production (.env.production)
```
# Update with your production URLs and keys
VITE_API_URL=https://your-api-domain.com
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Test your changes before submitting
- Write clear commit messages
- Update documentation as needed

## 🐛 Known Issues & Limitations

- (Add any known issues here)
- (Add feature limitations here)

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

For support, feature requests, or bug reports:
- 📧 Email: [your-email@example.com]
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/ReWrite_AI/issues)
- 🐦 Twitter: [@yourhandle]

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced customization options
- [ ] User authentication and saved rewrites
- [ ] Browser extension
- [ ] Mobile app
- [ ] API rate limiting and analytics

## 🙏 Acknowledgments

- Thanks to all contributors
- Built with amazing open-source tools
- Inspired by the need for better content enhancement

---

**Made with ❤️ by [Your Name/Team]**

⭐ If you like this project, please consider giving it a star!
