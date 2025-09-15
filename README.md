# NeuroTracker Desktop

A modern desktop application for neural activity tracking and cognitive assessment, built with Electron and React.

## Features

- **Cross-platform desktop application** - Runs on Windows, macOS, and Linux
- **Modern React interface** - Built with React 19 and TypeScript
- **AI-powered analysis** - Integrated with Google's Gemini AI
- **Real-time tracking** - Monitor and analyze neural patterns
- **Secure data handling** - Local storage with encrypted API communications

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tahasoomra9/-neurotracker.git
   cd neurotracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Gemini API key.

## Development

Start the development server:
```bash
npm run dev
```

This will start both the Vite dev server and Electron application.

## Building

Create a production build:
```bash
npm run build-exe
```

The built application will be available in the `dist` directory.

## Project Structure

```
├── electron/          # Electron main process files
├── src/              # React application source
├── components/       # Reusable UI components
├── services/         # API and data services
├── assets/           # Static assets and icons
└── examples/         # Usage examples and demos
```

## Technologies Used

- **Electron** - Desktop application framework
- **React 19** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Google Gemini AI** - AI analysis capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.