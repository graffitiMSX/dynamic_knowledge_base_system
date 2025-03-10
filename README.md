# Dynamic Knowledge Base System

A RESTful API for managing interconnected topics and resources with version control, user roles, and permissions.

---

## Installation

1. Install dependencies

```bash
npm install
```

---

2. Rename .env.example file in the root directory and fill in the required variables

## Running the Application

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Build the project:

```bash
npm run build
```

---

## API Documentation

### Health Check

- Health check

  > Get /health

### Topics

- Get All Topics

  > GET /api/topics

  Query Parameters:

  > page (optional): Page number (default: 1)
  > limit (optional): Items per page (default: 10, max: 100)

- Get Topic by ID

  > GET /api/topics/:id

- Get Topic Versions

  > GET /api/topics/:id/versions

- Get Specific Topic Version

  > GET /api/topics/:id/versions/:version

- Get Topic Hierarchy

  > GET /api/topics/hierarchy

  Query Parameters:

  > *rootId* (optional): Root topic ID to start hierarchy from

- Find Path Between Topics

  > GET /api/topics/path/:startId/:endId

- Create Topic
  > POST /api/topics

  *Required Role: Admin, Editor*

```json
{
  "name": "string",
  "content": "string",
  "parentTopicId": "string (optional)"
}
```

- Update Topic

  > PUT /api/topics/:id

  *Required Role: Admin, Editor*

```json
{
  "name": "string (optional)",
  "content": "string (optional)",
  "parentTopicId": "string (optional)"
}
```

- Delete Topic

  > DELETE /api/topics/:id

  *Required Role: Admin*

### Resources

- Get All Resources

  > GET /api/resources

  Query Parameters:

  > page (optional): Page number (default: 1)
  > limit (optional): Items per page (default: 10, max: 100)

- Get Resource by ID

  > GET /api/resources/:id

- Get Resources by Topic

  > GET /api/resources/topic/:topicId

- Create Resource

  > POST /api/resources

  *Required Role: Admin, Editor*

```json
{
  "topicId": "string",
  "url": "string",
  "description": "string",
  "type": "video | article | pdf"
}
```

- Update Resource

  > PUT /api/resources/:id

  *Required Role: Admin, Editor*

- Delete Resource

  > DELETE /api/resources/:id
  
  *Required Role: Admin*

### Users

- Login

  > POST /api/users/login

```json
{
  "email": "string",
  "password": "string"
}
```

  > Returns: access token, refresh token, and user information

- Logout

  > POST /api/users/logout

```json
{
  "refreshToken": "string"
}
```

- Refresh Token

  > POST /api/users/refresh-token

```json
{
  "refreshToken": "string"
}
```

  > Returns: new access token and refresh token pair

- Get All Users

  > GET /api/users

  *Required Role: Admin*

- Get User by ID

  > GET /api/users/:id

  *Required Role: Admin*

- Get User by Email

  > GET /api/users/email/:email

  *Required Role: Admin*

- Get Users by Role

  > GET /api/users/role/:role

  *Required Role: Admin*

- Create User

  > POST /api/users

  *Required Role: Admin*

```json
{
  "name": "string",
  "email": "string",
  "role": "Admin | Editor | Viewer"
}
```

- Update User

  > PUT /api/users/:id

  *Required Role: Admin*

```json
{
  "name": "string",
  "email": "string",
  "role": "Admin | Editor | Viewer",
  "password": "string"
}
```

- Delete User

  > DELETE /api/users/:id

  *Required Role: Admin*

### Authentication

All protected endpoints require authentication. Include the user's role in the request header:

```plaintext
Authorization: Bearer <token>
```

### Error Responses

The API returns standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error response format:

```json
{
  "error": "Error message"
}
```
