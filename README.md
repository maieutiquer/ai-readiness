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
- **Response Caching**: Stores assessment responses and AI-generated reports in PostgreSQL for faster retrieval and reduced API costs

## AI Agent Architecture

The application uses a multi-agent system built with LangChain.js:

1. **Data Analyst Agent**: Assesses company responses and identifies data-related gaps
2. **Strategy Advisor Agent**: Generates AI adoption strategies based on readiness score
3. **Technical Consultant Agent**: Recommends tools and technologies for AI integration
4. **Report Generator Agent**: Compiles findings into a structured report

## Caching System

The application implements a caching system to store assessment responses and AI-generated reports in PostgreSQL:

1. When a user submits an assessment, the system generates a hash of the input data
2. Before calling the OpenAI API, the system checks if an assessment with the same hash already exists in the database
3. If a match is found, the system returns the cached report instead of generating a new one
4. If no match is found, the system generates a new report and stores it in the database for future use

This approach reduces API costs and improves response times for repeated assessments.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-readiness.git
cd ai-readiness

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your OpenAI API key and database connection details to the .env file

# Push the database schema
pnpm prisma db push
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
- **Database**: PostgreSQL
- **AI**: LangChain.js, OpenAI API

## License

MIT
