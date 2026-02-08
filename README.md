# Biddy – Auction Platform

![image](https://sigrid-okt22pt-semester-project-2.netlify.app/assets/images/screenshot-homepage.png)

View the hosted website at: https://sigrid-okt22pt-semester-project-2.netlify.app/

## Description

Biddy is a browser-based auction platform developed as part of **Semester Project 2** at Noroff.
The goal of this project is to apply the skills learned over the past three semesters to create a
fully functional frontend application that consumes an existing API.

Users can create auction listings, place bids, and manage their profile and credits.
The project also demonstrates a professional development workflow including linting,
formatting, unit testing, and end-to-end testing.

All backend functionality is handled by the Noroff Auction API. This project focuses **only on the frontend**.

## Table of Contents

- [Description](#description)
- [Table of Contents](#table-of-contents)
- [Built With](#built-with)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Planning & Design](#planning--design)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Built With

- ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
- ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
- ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
- **Noroff Auction API**
- **ESLint**
- **Prettier**
- **Vitest**
- **Playwright**
- **Node.js & npm**
- **Font Awesome**

## Setup and Installation

To set up and run this project locally, follow these steps:

1. **Clone the repository:**

```sh
git clone https://github.com/Sigrid-Okt22PT/Semester-Project-2.git
```

2. **Navigate to the project directory:**

```sh
cd semester-project-2
```

3. **Install dependencies:**

```sh
npm install
```

4. **Start the development build (Tailwind):**

```sh
npm run dev
```

5. **Open the project in your browser**
   Use a local server such as Live Server or the Netlify dev server.

## Code quality

This project uses ESLint to help maintain consistent code style and catch common errors during development.

Linting is not required to run the project, but can be run during development with:

```bash
npm run lint
```

## Usage

### Visitors (Not logged in)

- Browse and search auction listings
- View listing details and bids

### Registered Users

- Register with a `@stud.noroff.no` email
- Log in and log out
- Receive 1000 credits on registration
- Create, update, and delete listings
- Place bids on other users’ listings
- View total credits and bidding history

## Testing

This project includes both **unit tests** and **end-to-end tests** as required by the assignment.

### Unit Tests (Vitest)

Vitest is used to test core logic and utilities such as:

- register
- login
- listings
- bidding
- authUI

Run unit tests:

```sh
npm run test
```

Unit tests are located in:

```
js/test/
```

### End-to-End Tests (Playwright)

Playwright is used to test real user flows, including:

- Login
- Registration
- Searching listings
- Creating listings

Run E2E tests:

```sh
npm run test:e2e
```

Run E2E tests in interactive mode:

```sh
 npm run test:e2e-ui
```

Show Playwright report:

```sh
npx playwright show-report
```

## Environment Variables

Create a `.env` file in the project root:

```env
E2E_BASE_URL=http://localhost:4173
E2E_USER_EMAIL=youruser@stud.noroff.no
E2E_USER_PASSWORD=YourPassword123
```

If the login credentials do not exist, create a new user using the registration form.
OBS! The login test will not work without an already registered user

## Planning & Design

The project follows the technical restrictions defined in the brief:

- **CSS Framework:** Tailwind CSS
- **Hosting:** Netlify
- **Design Tool:** Figma
- **Planning Tool:** GitHub Projects

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch:

```sh
git checkout -b feature-branch
```

3. Commit your changes:

```sh
git commit -m "Describe your changes"
```

4. Push to your fork and open a Pull Request

## License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.

## Contact

[My LinkedIn Page](https://www.linkedin.com/in/sigrid-johanne-husev%C3%A5g-132513a5/)
