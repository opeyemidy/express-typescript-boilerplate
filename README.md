# Express TypeScript Boilerplate

This is a boilerplate project using Express with TypeScript, designed to be a starting point for developing robust applications. It provides a structured folder layout, essential middleware packages, and configurations to speed up the development process.

## Features

-   **Express:** Fast, unopinionated, minimalist web framework.
-   **TypeScript:** Typed JavaScript at any scale.
-   **Environment Configuration:** Manage environment variables using `dotenv`.
-   **Security:** Basic security protections via helmet, rate limiting, and input sanitation.
-   **Logging:** Winston for logging, supporting various levels of log management.
-   **Linting & Formatting:** ESLint and Prettier integration for code quality and consistency.
-   **API Documentation:** Swagger for creating interactive API documentation.
-   **Validation:** Validate request payloads and parameters.

## Project Structure

```
src\
 |-- index.ts          # Main entry point
 |-- app.ts            # Initializes and configures Express app
 |-- routes\           # Application routes
 |-- controllers\      # Route controllers
 |-- models\           # Database models
 |-- middlewares\      # Custom express middlewares
 |-- utils\            # Utility functions
 |-- config\           # Configuration files
 |-- docs\             # Swagger YAML files for API documentation
 |-- services\         # DB queries logic separated from controllers and others services
 |-- types\            # TypeScript type definitions
 |-- validations\      # Request validation schemas
```

## Scripts

-   **dev**: Run the app in development mode using `ts-node-dev`.
-   **build**: Compiles TypeScript into JavaScript files.
-   **start**: Runs the application from the `dist` directory.
-   **lint**: Lint the TypeScript codebase using ESLint.
-   **lint:fix**: Automatically fix linting issues.
-   **format**: Formats the code using Prettier.
-   **format:check**: Checks the code formatting without making changes.
-   **prepare**: Husky Git hooks setup script.

## Dependencies

### Main

-   `express`: Core framework.
-   `mongoose`: MongoDB object modeling tool.
-   `jsonwebtoken`: Token-based authentication.
-   Security packages: `helmet`, `cors`, `xss-clean`, etc.
-   Logging: `winston`, `morgan`.
-   Validation: `express-validator`.
-   Documentation: `swagger-ui-express`, `yamljs`.

### Development

-   `typescript`: Type language transpiler.
-   `eslint` & `prettier`: For code style and quality.
-   `husky` & `lint-staged`: For managing Git hooks and running scripts.

## Getting Started

1. **Clone the repo**:

    ```bash
    git clone https://github.com/username/express-typescript-boilerplate.git
    cd express-typescript-boilerplate
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Environment setup**:

    - Copy `.env.example` to `.env` and update with your specific configuration:

4. **Run in development mode**:

    ```bash
    npm run dev
    ```

5. **Build for production**:

    ```bash
    npm run build
    ```

6. **Start the production server**:
    ```bash
    npm start
    ```

## Contribution

Feel free to fork or suggest improvements via pull requests. If you encounter any bugs, please report them.

## Inspiration

-   [danielfsousa/express-rest-es2017-boilerplate](https://github.com/danielfsousa/express-rest-es2017-boilerplate)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
