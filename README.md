# AI Readiness Assessment Tool

This application helps organizations assess their readiness for AI adoption through a comprehensive assessment framework powered by specialized AI agents.

## Features

- **Multi-agent AI System**: Utilizes specialized AI agents to analyze different aspects of AI readiness
- **Comprehensive Assessment**: Evaluates readiness across four key pillars:
  - Technology Readiness
  - Leadership Alignment
  - Actionable Strategy
  - Systems Integration
- **Detailed Recommendations**: Provides tailored recommendations based on assessment responses

## AI Agent Architecture

The application uses a multi-agent system built with LangChain.js:

1. **Data Analyst Agent**: Assesses company responses and identifies data-related gaps
2. **Strategy Advisor Agent**: Generates AI adoption strategies based on readiness score
3. **Technical Consultant Agent**: Recommends tools and technologies for AI integration
4. **Report Generator Agent**: Compiles findings into a structured report

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-readiness.git
cd ai-readiness

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your OpenAI API key to the .env file
```

### Development

```bash
# Start the development server
pnpm dev
```

### Production

```bash
# Build for production
pnpm build

# Start the production server
pnpm start
```

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: tRPC, Prisma
- **AI**: LangChain.js, OpenAI API

## License

MIT
