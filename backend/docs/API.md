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

- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Rate Limiting](#rate-limiting)
    - [Response to Rate Limit Exceedance](#response-to-rate-limit-exceedance)
  - [Endpoints](#endpoints)
    - [Table of Contents](#table-of-contents)
    - [Authentication Endpoints](#authentication-endpoints)
      - [User Registration](#user-registration)
      - [Complete Registration](#complete-registration)
      - [User Login](#user-login)
      - [Refresh Token](#refresh-token)
      - [Reset Password](#reset-password)
      - [Complete Reset Password](#complete-reset-password)
    - [User Endpoints](#user-endpoints)
      - [Get User](#get-user)
      - [Get Settings](#get-settings)
      - [Get Safety Records](#get-safety-records)
      - [Update Username](#update-username)
      - [Update Email](#update-email)
      - [Complete Email Update](#complete-email-update)
      - [Update Password](#update-password)

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

#### Complete Registration

- **URL:** `/api/auth/complete-registration`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "token": "JWT_TOKEN (received in email)",
    "username": "username",
    "password": "password"
  }
  ```

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "User created successfully."
    }
    ```

    > **Note:** The user data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid username.",
      "error": {
        "code": "INVALID_USERNAME",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid password.",
      "error": {
        "code": "INVALID_PASSWORD",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid token.",
      "error": {
        "code": "INVALID_TOKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `401 Unauthorized`

    ```json
    {
      "status": "error",
      "message": "Token expired.",
      "error": {
        "code": "TOKEN_EXPIRED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error verifying token.",
      "error": {
        "code": "VERIFY_TOKEN_ERROR",
        "details": {}
      }
    }
    ```

  - **Status:** `409 Conflict`

    ```json
    {
      "status": "error",
      "message": "Email already in use.",
      "error": {
        "code": "EMAIL_IN_USE",
        "details": {}
      }
    }
    ```

  - **Status:** `409 Conflict`

    ```json
    {
      "status": "error",
      "message": "Username already in use.",
      "error": {
        "code": "USERNAME_IN_USE",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error creating user.",
      "error": {
        "code": "CREATE_USER_ERROR",
        "details": {}
      }
    }
    ```

#### User Login

- **URL:** `/api/auth/login`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "identifier": "email or username",
    "password": "password"
  }
  ```

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {
        "user": {},
        "refreshToken": "JWT_TOKEN",
        "accessToken": "JWT_TOKEN"
      },
      "message": "User logged in successfully."
    }
    ```

    > **Note:** The user data, refresh token, and access token will be returned in the response (`data` field). The access token should be used to access protected routes, and the refresh token should be used to generate a new access token when it expires.

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid email or username.",
      "error": {
        "code": "INVALID_IDENTIFIER",
        "details": {}
      }
    }
    ```

  - **Status:** `401 Unauthorized`

    ```json
    {
      "status": "error",
      "message": "Invalid password.",
      "error": {
        "code": "INVALID_PASSWORD",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "User not found.",
      "error": {
        "code": "USER_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Account locked.",
      "error": {
        "code": "ACCOUNT_LOCKED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error logging in user.",
      "error": {
        "code": "LOGIN_USER_ERROR",
        "details": {}
      }
    }
    ```

#### Refresh Token

- **URL:** `/api/auth/refresh-token`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "refreshToken": "JWT_TOKEN"
  }
  ```

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {
        "accessToken": "JWT_TOKEN"
      },
      "message": "Access token refreshed successfully."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid refresh token.",
      "error": {
        "code": "INVALID_REFRESH_TOKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid token.",
      "error": {
        "code": "INVALID_TOKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `401 Unauthorized`

    ```json
    {
      "status": "error",
      "message": "Token expired.",
      "error": {
        "code": "TOKEN_EXPIRED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error refreshing token.",
      "error": {
        "code": "REFRESH_TOKEN_ERROR",
        "details": {}
      }
    }
    ```

#### Reset Password

- **URL:** `/api/auth/reset-password`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "callbackUrl": "https://example.com/reset-password"
  }
  ```

  > **Note:** The `callbackUrl` is the URL will be the url sent to the user in the email for email verification.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": null,
      "message": "Password reset email sent."
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

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "User not found.",
      "error": {
        "code": "USER_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error sending password reset email.",
      "error": {
        "code": "SEND_EMAIL_ERROR",
        "details": {}
      }
    }
    ```

#### Complete Reset Password

- **URL:** `/api/auth/complete-reset-password`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "token": "JWT_TOKEN",
    "password": "new_password"
  }
  ```

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Password reset successfully."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid password.",
      "error": {
        "code": "INVALID_PASSWORD",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid token.",
      "error": {
        "code": "INVALID_TOKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `401 Unauthorized`

    ```json
    {
      "status": "error",
      "message": "Token expired.",
      "error": {
        "code": "TOKEN_EXPIRED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error verifying token.",
      "error": {
        "code": "VERIFY_TOKEN_ERROR",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "User not found.",
      "error": {
        "code": "USER_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error resetting password.",
      "error": {
        "code": "RESET_PASSWORD_ERROR",
        "details": {}
      }
    }
    ```

### User Endpoints

#### Get User

- **URL:** `/api/users/:id`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the user to get.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "User found successfully."
    }
    ```

  > **Note:** The user data will be returned in the response (`data` field).

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "User not found.",
      "error": {
        "code": "USER_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error getting user.",
      "error": {
        "code": "GET_USER_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Get Settings

- **URL:** `/api/users/:id/settings`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the user to get settings for.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Settings found successfully."
    }
    ```

  > **Note:** The settings will be returned in the response (`data` field).

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to get settings for this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error getting settings.",
      "error": {
        "code": "GET_SETTINGS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only get settings for their own account.

#### Get Safety Records

- **URL:** `/api/users/:id/safety-records`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the user to get safety records for.

- **Query Parameters**:

  - `limit`: The number of safety records to return (default: 10).
  - `offset`: The number of safety records to skip (default: 0).

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": [],
      "message": "Safety records found successfully."
    }
    ```

  > **Note:** The safety records will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid limit.",
      "error": {
        "code": "INVALID_LIMIT",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid offset.",
      "error": {
        "code": "INVALID_OFFSET",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to get safety records for this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error getting safety records.",
      "error": {
        "code": "GET_SAFETY_RECORDS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only get safety records for their own account.

#### Update Username

- **URL:** `/api/users/:id/username`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "username": "new_username"
  }
  ```

  > **Note:** The new username to update.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Username updated successfully."
    }
    ```

    > **Note:** The updated user data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid username.",
      "error": {
        "code": "INVALID_USERNAME",
        "details": {}
      }
    }
    ```

  - **Status:** `409 Conflict`

    ```json
    {
      "status": "error",
      "message": "Username already taken.",
      "error": {
        "code": "USERNAME_TAKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error updating username.",
      "error": {
        "code": "UPDATE_USERNAME_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own username.

#### Update Email

- **URL:** `/api/users/:id/email`
- **Method:** `POST`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "email": "new_email",
    "callbackUrl": "https://example.com/verify-email"
  }
  ```

  > **Note:** The new email to update and the `callbackUrl` is the URL will be the url sent to the user in the email for email verification.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": null,
      "message": "Email verification sent successfully."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid email.",
      "error": {
        "code": "INVALID_EMAIL",
        "details": {}
      }
    }
    ```

  - **Status:** `409 Conflict`

    ```json
    {
      "status": "error",
      "message": "Email already taken.",
      "error": {
        "code": "EMAIL_TAKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
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

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own email.

#### Complete Email Update

- **URL:** `/api/users/:id/email/complete`
- **Method:** `POST`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "token": "JWT_TOKEN"
  }
  ```

  > **Note:** The token received in the email for email verification.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Email updated successfully."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid token.",
      "error": {
        "code": "INVALID_TOKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `401 Unauthorized`

    ```json
    {
      "status": "error",
      "message": "Token expired.",
      "error": {
        "code": "TOKEN_EXPIRED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error verifying token.",
      "error": {
        "code": "VERIFY_TOKEN_ERROR",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error updating email.",
      "error": {
        "code": "UPDATE_EMAIL_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own email.

#### Update Password

- **URL:** `/api/users/:id/password`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "currentPassword": "current_password",
    "newPassword": "new_password"
  }
  ```

  > **Note:** The current password and the new password to update.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Password updated successfully."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid password.",
      "error": {
        "code": "INVALID_PASSWORD",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid new password.",
      "error": {
        "code": "INVALID_NEW_PASSWORD",
        "details": {}
      }
    }
    ```

  - **Status:** `401 Unauthorized`

    ```json
    {
      "status": "error",
      "message": "Incorrect password.",
      "error": {
        "code": "INCORRECT_PASSWORD",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error updating password.",
      "error": {
        "code": "UPDATE_PASSWORD_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own password.
