# IoT Sphere

## Project Description

This project, "IoT Sphere", is a monorepo managed by [Nx](https://nx.dev/). It is designed as a platform likely related to Internet of Things (IoT) applications. The monorepo contains a frontend application and several backend services, along with shared libraries to promote code reusability.

## Technologies Used

The project utilizes a variety of modern technologies:

*   **Nx**: Monorepo management tool for task running, dependency management, and code generation.
*   **Yarn**: Package manager.
*   **React**: JavaScript library for building user interfaces (used in the `dashboard`).
*   **Vite**: Fast frontend build tool (used for the `dashboard`).
*   **Tailwind CSS**: Utility-first CSS framework for styling the frontend.
*   **Dapr (Distributed Application Runtime)**: Provides building blocks for microservice applications, such as publish/subscribe, state management, and service invocation (used in the `otel-library` and likely by backend services).
*   **OpenTelemetry (OTEL)**: Framework for generating, collecting, and exporting telemetry data (traces, metrics, and logs) to observe the applications' behavior (integrated via the `otel-library`).
*   **NestJS**: A progressive Node.js framework for building efficient, reliable and scalable server-side applications (likely used for the backend services `devices` and `gateway`).
*   **TypeScript**: Primary language used across the monorepo.

## Project Structure

The monorepo is organized into `apps` and `libs` directories:

*   `apps/frontend/dashboard`: The React frontend application.
*   `apps/backend/devices`: A backend service, potentially handling device interactions.
*   `apps/backend/gateway`: Another backend service, possibly acting as an API gateway.
*   `libs/entity-lib`: A shared library, likely containing data models or interfaces.
*   `apps/backend/shared/otel-library`: A shared library integrating Dapr and OpenTelemetry for observability.

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**

    ```bash
    yarn install
    ```

3.  **Explore available tasks:** Use Nx commands to build, test, and serve the applications. For example:

    ```bash
    yarn nx serve dashboard
    yarn nx build devices
    yarn nx test gateway
    ```

    Refer to the `project.json` files within each application/library directory for specific targets.

## Contribution

[Add contribution guidelines here]
