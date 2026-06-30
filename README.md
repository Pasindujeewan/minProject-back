# minProject-back
this is university project
# Assignment Analyzer API

A Node.js and Express.js backend application that analyzes assignments, determines their difficulty level, stores the results, and sends notifications to users. The project is designed with a clean architecture, robust validation, centralized error handling, and a RESTful API structure.

---

## Features

* User authentication
* JWT-based authorization
* Assignment submission
* Assignment difficulty analysis
* Automatic difficulty score calculation
* Store assignment analysis results in the database
* Push notification support
* Input validation using Zod
* Global error handling
* RESTful API design
* CORS support
* Environment variable configuration
* MongoDB integration with Mongoose

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* JSON Web Token (JWT)
* bcrypt

### Validation

* Zod

### Notifications

* Firebase Cloud Messaging (FCM)

### Other Tools

* dotenv
* CORS
* Git & GitHub

---

## Project Structure

```
src/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
│
├── app.js
└── server.js
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/your-repository.git
```

Move into the project folder:

```bash
cd your-repository
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure your environment variables.

Start the development server:

```bash
npm run dev
```

---

## Environment Variables

Example:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

FCM_PROJECT_ID=your_project_id
FCM_CLIENT_EMAIL=your_client_email
FCM_PRIVATE_KEY=your_private_key
```

---

## API Endpoints

### Authentication

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| POST   | `/api/v1/auth/register` | Register a new user |
| POST   | `/api/v1/auth/login`    | Login user          |

### Assignments

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/v1/assignments`     | Submit an assignment   |
| GET    | `/api/v1/assignments`     | Get all assignments    |
| GET    | `/api/v1/assignments/:id` | Get assignment details |

---

## Assignment Analysis Flow

1. User submits an assignment.
2. The assignment is validated.
3. The system analyzes the assignment.
4. A difficulty score is calculated.
5. The difficulty level is determined.
6. The assignment and analysis results are stored in MongoDB.
7. A notification is sent to the user with the analysis result.

---

## Error Handling

The project uses centralized error handling with custom API errors.

* Validation errors
* Authentication errors
* Authorization errors
* Database errors
* Not Found (404)
* Internal Server Errors (500)

---

## Validation

All incoming request data is validated using Zod before reaching the controllers.

Example validations include:

* Name
* Email
* Password
* Assignment data

---

## Security

* Password hashing using bcrypt
* JWT authentication
* Protected routes
* Environment variable management
* Input validation
* Centralized error handling

---

## Future Improvements

* Assignment history
* Difficulty prediction using AI/ML
* Email notifications
* User dashboard
* Admin dashboard
* Analytics and reporting
* Unit and integration testing
* Docker support
* CI/CD pipeline

---

## Author

Developed by **Pasindu Jeewan**

---

## License

This project is licensed under the MIT License.
