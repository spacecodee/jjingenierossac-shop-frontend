# **Sales Management Web Application - Frontend**

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

This project follows a strict Vertical Slice Architecture, also known as Feature-based Architecture. This approach is a blend of three related concepts. Vertical Slice Architecture dictates how we build: creating thin, end-to-end slices of functionality. Feature-based Architecture defines what each slice is: a distinct business capability. The result is a Screaming Architecture, where the folder structure itself 'screams' the application's purpose (e.g., `/orders`, `/products`) rather than its technical details (e.g., `/controllers`, `/services`).

## Project Overview

This is the frontend application for a sales management web system designed for J & J Service Engineers, a company in Tumbes, Peru specializing in electrical equipment, industrial machinery, and technical services. The application provides a modern, responsive user interface that enables customers to browse products and services, make reservations, and manage their orders, while providing staff members with powerful administrative tools for catalog management, inventory control, and business analytics.

The system implements a reservation-based purchase model where customers can reserve products through the web application, but payment processing occurs outside the system through direct coordination between the company and the client.

### 2. Core Technical Rules (Mandatory)

- **Package Manager**: You **MUST** use `pnpm` for all dependency management. Do not suggest `npm` or `yarn` commands.
- **Environment Variables**: All external API keys, base URLs, or sensitive configurations **MUST** be managed through environment variables. Use Angular's `environment.ts` files. Do not hardcode secrets.
- **Execution**: You **MUST NEVER** generate code that executes the project (e.g., `ng serve`, `pnpm start`). Your role is to write and modify code, not to run it.
- **Styling**: The project uses **TailwindCSS v4**. All styling must be done through Tailwind utility classes. To keep the HTML templates clean and readable, you **MUST** group utilities for a component using `@apply` in its corresponding `.css` file. Do not write custom, non-Tailwind CSS properties directly.
- **Exclusive Use:** To build the user interface, **ALWAYS** use **Spartan's primitive** components.
- **Comments and Emojis**:
  - Code **MUST NOT** contain emojis.
  - Code **MUST NOT** contain comments. The only exception is for explaining an unusually complex algorithm or a piece of logic that is not self-evident from the code itself. In such cases, the comment must be concise and clear.

### 3. Code Quality and Best Practices

- **Clean Code**: Write simple, readable, and self-documenting code. Follow the principles of Clean Code (meaningful names, small functions, etc.).
- **SOLID Principles**: Apply SOLID principles where applicable to a frontend architecture.
- **Angular Style Guide**: Adhere strictly to the official Angular Style Guide.
- **State Management**: **MUST** use **Angular Signals** for state management. Use `signal()` for mutable state and `computed()` for derived values. Avoid using RxJS `BehaviorSubject` for state.
- **Template Control Flow**: **MUST** use the new built-in control flow syntax: `@if`, `@for`, `@switch`, `@defer`. The use of `*ngIf`, `*ngFor`, and `*ngSwitch` is forbidden.
- **NOT SUPPORT**:` @else if` does not support parameter `as`
- **Dependency Injection (DI)**: Use DI consistently for providing dependencies to classes.
- **Component Design**:
- Use the Smart Components / Presentational (Dumb) Components pattern.
- Use `ChangeDetectionStrategy.OnPush` in all components to optimize performance.
- Semantic HTML:
  1. MANDATORY: Always use semantic HTML5 tags to structure content.
  2. Prefer `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>` instead of using `<div>` for everything. This improves accessibility (a11y) and SEO.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for the local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
