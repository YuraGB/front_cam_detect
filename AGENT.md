# Agent Configuration

## Overview

This agent is configured to assist with development tasks in the `front_cam_detect` project, which appears to be a frontend camera detection application.

## Capabilities

### Core Skills Available

1. **Better Auth Best Practices** - Configure TypeScript authentication with email/password, OAuth, and plugin configuration
2. **Fallow** - Codebase intelligence for JavaScript/TypeScript (quality reports, cleanup opportunities, circular dependencies)
3. **React Component Performance** - Diagnose slow React components and suggest performance fixes
4. **React Doctor** - Scan React code for lint issues, accessibility problems, bundle size, and architecture concerns
5. **TanStack Start Best Practices** - Full-stack React patterns including SSR, middleware, authentication, and deployment
6. **TypeScript Advanced Types** - Master generics, conditional types, mapped types, template literals, and utility types

### Available Tools

- `read` - Read text files and images (jpg, png, gif, webp) with optional offset/limit for large files
- `bash` - Execute bash commands in the current working directory with optional timeout
- `edit` - Edit single files using exact text replacement with unique non-overlapping regions
- `write` - Write content to files, creating parent directories as needed

## Project Context

The agent operates within the `/home/theyuhur/Projects/front_cam_detect` directory and can:

- Analyze existing code structure and dependencies
- Provide recommendations for React/TanStack Start applications
- Help with TypeScript type safety and advanced type patterns
- Audit code quality using fallow's static analysis
- Diagnose performance issues in React components
- Fix bugs and implement features following best practices

## Usage Patterns

### Code Analysis
```bash
# Run fallow to audit the codebase
fallow --report-quality
fallow --find-circular-dependencies
fallow --cleanup-opportunities
```

### Component Diagnostics
```bash
# Scan for React issues
react-doctor --scan-component <path>
react-doctor --check-bundle-size
```

### Authentication Setup
When working with Better Auth, the agent will:
- Configure server and client settings
- Set up database adapters
- Manage sessions properly
- Add plugins as needed

## Notes

This configuration is designed to work seamlessly with TanStack Start's full-stack capabilities while maintaining TypeScript type safety throughout the application.
