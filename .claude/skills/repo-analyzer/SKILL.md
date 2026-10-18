---
name: repo-analyzer
description: Analyze an existing code repository to understand its architecture, directory structure, execution flow, modules, dependencies, data flow, and implementation patterns. Use before modifying unfamiliar codebases or investigating how existing functionality works.
---

# Repository Analyzer

## Objective

Analyze the existing repository to build an accurate understanding of how the application works. Prioritize actual implementation details over assumptions.

**Analysis only. Do not modify files, implement fixes, refactor code, or install dependencies.**

## Analysis Workflow

### 1. Understand the Repository

- Identify the application type, frameworks, languages, and package managers.
- Inspect the root directory, configuration files, package manifests, and existing documentation.
- Identify frontend, backend, database, shared modules, scripts, tests, and deployment configuration where applicable.
- Respect existing instructions in `CLAUDE.md`, `AGENTS.md`, and relevant project documentation.

### 2. Map the Architecture

- Identify major modules and their responsibilities.
- Trace how the application starts and how its components connect.
- Identify API routes, middleware, services, database access, authentication, and external integrations where applicable.
- Explain how requests and data flow between the major components.
- Identify important configuration and environment-variable dependencies without exposing secret values.

### 3. Trace Existing Functionality

When analyzing a specific feature or module:

- Trace the execution path from entry point to final outcome.
- Identify the relevant components, functions, services, API endpoints, and database models.
- Explain dependencies and interactions with other modules.
- Identify validation, error handling, authorization, and state-management logic where applicable.
- Reference actual file paths and function names.

### 4. Inspect Dependencies and Conventions

- Identify important internal and external dependencies.
- Understand existing coding patterns, naming conventions, and module boundaries.
- Determine how configuration, logging, testing, migrations, and builds are handled.
- Identify established patterns that new changes should follow.

### 5. Validate Findings

- Read the relevant source files before making claims.
- Follow imports, function calls, and references to verify relationships.
- Use targeted searches and existing tests when useful.
- Distinguish verified facts from reasonable inferences and unknowns.
- Do not assume that a dependency, feature, or workflow exists merely because its configuration is present.

## Output Format

Keep the report concise, factual, and useful for future development.

### 1. Repository Overview
- Application purpose
- Main technologies
- Entry points
- Major modules

### 2. Architecture and Data Flow
- How major components interact
- Request or execution flow
- Database and external service interactions

### 3. Important Files
List only relevant files with a short explanation of each file's responsibility.

### 4. Existing Implementation Patterns
- State management and data access patterns
- API and error-handling conventions
- Authentication and authorization flow
- Testing and configuration approach

Include only applicable findings.

### 5. Key Dependencies and Constraints
Document important module dependencies, shared logic, configuration requirements, and constraints that could affect future changes.

### 6. Uncertainties
List only important questions or areas that could not be verified from the available code.

## Rules

- Analyze the repository before proposing implementation changes.
- Base findings on source code, not filenames or assumptions alone.
- Avoid reading every file indiscriminately; follow relevant execution paths.
- Exclude generated files, build output, dependency directories, and unrelated assets unless necessary.
- Never expose credentials, tokens, private keys, or environment-variable secret values.
- Do not report speculative issues as confirmed problems.
- Do not recommend unrelated refactoring, redesigns, or optimizations.
- Do not duplicate the same finding across sections.
- Do not modify the repository during analysis.

The goal is to give a developer a reliable mental model of the existing codebase without overwhelming them with unnecessary details.