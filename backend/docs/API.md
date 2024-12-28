# API Documentation

The GradeAnalyzer application provides a RESTful API to interact with the GradeAnalyzer backend. The API is secured with JWT (JSON Web Token) authentication and includes rate limiting to prevent abuse.

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected routes, the client must include a valid JWT token in the `Authorization` header of the HTTP request. (Access tokens are valid for 15 minutes, and refresh tokens are valid for 30 days.)

## Rate Limiting

The API has specific rate limits for different functionalities to ensure fair usage and performance. The limits are as follows:

1. **Registration and Password/Email Reset**:

   - **Rate Limit**: 3 requests every 2 minutes per IP address.
   - **Description**: This functionality involves sending verification emails. Users are allowed up to 3 registration or password reset requests every 2 minutes.

2. **Login**:

   - **Rate Limit**: 15 requests every hour per IP address.
   - **Description**: Users can attempt to log in up to 15 times within a 1-hour period.

3. **Other API Features**:
   - **Rate Limit**: 150 requests every 5 minutes per IP address.
   - **Description**: For all other API functionalities not explicitly listed, users can send up to 150 requests every 5 minutes.

### Response to Rate Limit Exceedance

If the rate limit is exceeded, the server will respond with a `429 Too Many Requests` status code, indicating that the user has made too many requests in a given timeframe. Users should manage their request rates accordingly to avoid interruptions in service.

## Endpoints

### Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
  - [User Registration](#user-registration)

### Authentication Endpoints

#### User Registration

- **URL:** `/api/auth/register`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "callbackUrl": "https://example.com/verify-email"
  }
  ```

  > **Note:** The `callbackUrl` is the URL will be the url sent to the user in the email for email verification.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": null,
      "message": "Verification email sent."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid email address.",
      "error": {
        "code": "INVALID_EMAIL",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error sending verification email.",
      "error": {
        "code": "SEND_EMAIL_ERROR",
        "details": {}
      }
    }
    ```
