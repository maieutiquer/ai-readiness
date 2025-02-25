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
- **Dynamic AI Responses**: AI agents ask follow-up questions based on user input to gather more information and provide more accurate assessments

## AI Agent Architecture

The application uses a multi-agent system built with LangChain.js:

1. **Data Analyst Agent**: Assesses company responses and identifies data-related gaps
2. **Strategy Advisor Agent**: Generates AI adoption strategies based on readiness score
3. **Technical Consultant Agent**: Recommends tools and technologies for AI integration
4. **Report Generator Agent**: Compiles findings into a structured report

Each agent can ask follow-up questions to gather more specific information when needed, leading to more accurate and personalized assessments.

## Caching System

The application implements a caching system to store assessment responses and AI-generated reports in PostgreSQL:

1. When a user submits an assessment, the system generates a hash of the input data
2. Before calling the OpenAI API, the system checks if an assessment with the same hash already exists in the database
3. If a match is found, the system returns the cached report instead of generating a new one
4. If no match is found, the system generates a new report and stores it in the database for future use

This approach reduces API costs and improves response times for repeated assessments.

## Interactive Follow-up Questions

The application implements an interactive follow-up question system:

1. When a user submits an assessment, AI agents analyze the responses and may identify areas where more information would be helpful
2. If an agent needs more information, it generates a specific follow-up question with context explaining why the information is needed
3. The user can answer the question directly in the UI
4. When a follow-up question is answered, the system updates the assessment with the new information
5. The AI report is regenerated with the additional context, providing a more accurate and personalized assessment

This approach creates a more interactive experience and allows the AI to gather the specific information it needs to provide the most valuable insights.

## User Experience Improvements

The application includes several user experience improvements:

1. **Simplified Form**: The assessment form is divided into required and optional fields, making it easier for users to complete
2. **Collapsible Sections**: Optional fields are hidden by default and can be expanded when needed
3. **Unique Question IDs**: Each follow-up question has a unique ID to prevent conflicts and ensure proper tracking
4. **State Management**: The application properly manages state to prevent issues with pending states and ensure smooth user interactions

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
