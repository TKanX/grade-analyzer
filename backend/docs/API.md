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
      - [Update Profile](#update-profile)
      - [Update Settings](#update-settings)
    - [Grade Endpoints](#grade-endpoints)
      - [Create Grade](#create-grade)
      - [Get Grades](#get-grades)
      - [Get Grade](#get-grade)
      - [Update Grade](#update-grade)
      - [Update Grade (Partial (JSON Patch))](#update-grade-partial-json-patch)
      - [Delete Grade](#delete-grade)
      - [Export Grade](#export-grade)

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

    > **Note:** The updated user data will be returned in the response (`data` field).

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

#### Update Profile

- **URL:** `/api/users/:id/profile`
- **Method:** `PATCH`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "name": "new_name",
    "avatar": "new_avatar",
    "birthday": "new_birthday",
    "school": "new_school",
    "country": "new_country"
  }
  ```

  > **Note:** The new profile information to update. Fields are optional. `name` and `school` are strings, `avatar` is a Base64-encoded image or a empty string, `birthday` is a date string (e.g., "2000-01-01") or `null`, and `country` is a 2-letter country code (e.g., "US") or an empty string.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Profile updated successfully."
    }
    ```

    > **Note:** The updated user data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid name.",
      "error": {
        "code": "INVALID_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid avatar.",
      "error": {
        "code": "INVALID_AVATAR",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid birthday.",
      "error": {
        "code": "INVALID_BIRTHDAY",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid school.",
      "error": {
        "code": "INVALID_SCHOOL",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid country.",
      "error": {
        "code": "INVALID_COUNTRY",
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
      "message": "Error updating profile.",
      "error": {
        "code": "UPDATE_PROFILE_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own profile.

#### Update Settings

- **URL:** `/api/users/:id/settings`
- **Method:** `PATCH`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "timeFormat": "12h",
    "dateFormat": "MM-DD-YYYY",
    "theme": "system"
  }
  ```

  > **Note:** The new settings to update. Fields are optional. `timeFormat` can be "12h" or "24h", `dateFormat` can be "MM-DD-YYYY" or "DD-MM-YYYY" or "YYYY-MM-DD", and `theme` can be "light", "dark", or "system".

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Settings updated successfully."
    }
    ```

    > **Note:** The updated settings will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid time format.",
      "error": {
        "code": "INVALID_TIME_FORMAT",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid date format.",
      "error": {
        "code": "INVALID_DATE_FORMAT",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid theme.",
      "error": {
        "code": "INVALID_THEME",
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
      "message": "Error updating settings.",
      "error": {
        "code": "UPDATE_SETTINGS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own settings.

### Grade Endpoints

#### Create Grade

- **URL:** `/api/grades`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "name": "grade_name",
    "startDate": "start_date",
    "endDate": "end_date"
  }
  ```

  > **Note:** The grade name, start date, and end date to create. The `name` is a string, `startDate` and `endDate` is a date string (e.g., "2000-01-01") (optional).

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Grade created successfully."
    }
    ```

    > **Note:** The created grade data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid grade name.",
      "error": {
        "code": "INVALID_GRADE_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid start date.",
      "error": {
        "code": "INVALID_START_DATE",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid end date.",
      "error": {
        "code": "INVALID_END_DATE",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error creating grade.",
      "error": {
        "code": "CREATE_GRADE_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Get Grades

- **URL:** `/api/grades`
- **Method:** `GET`

- **Query Parameters**:

  - `detailed`: Whether to return detailed grade information (default: false).

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": [],
      "message": "Grades retrieved successfully."
    }
    ```

    > **Note:** The grades will be returned in the response (`data` field).

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error getting grades.",
      "error": {
        "code": "GET_GRADES_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only get grades for their own account.

#### Get Grade

- **URL:** `/api/grades/:id`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the grade to get.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Grade retrieved successfully."
    }
    ```

    > **Note:** The grade data will be returned in the response (`data` field).

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Grade not found.",
      "error": {
        "code": "GRADE_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to get grade for this user.",
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
      "message": "Error getting grade.",
      "error": {
        "code": "GET_GRADE_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only get grades for their own account.

#### Update Grade

- **URL:** `/api/grades/:id`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the grade to update.

- **Request Body**:

  ```json
  {
    "name": "new_grade_name",
    "startDate": "new_start_date",
    "endDate": "new_end_date",
    "courses": [],
    "gradingMode": "new_grading_mode",
    "gradingRange": []
  }
  ```

  > **Note:** The new grade information to update. Fields are optional. `name` is a string, `startDate` and `endDate` is a date string (e.g., "2000-01-01"), `courses` is the course objects, `gradingMode` is a string ("continuous" or "discrete"), and `gradingRange` is the grading range objects. (Details of the course and grading range objects can be found in the `src/models/gradeSchema.js` file.)

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Grade updated successfully."
    }
    ```

    > **Note:** The updated grade data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid grade name.",
      "error": {
        "code": "INVALID_GRADE_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid start date.",
      "error": {
        "code": "INVALID_START_DATE",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid end date.",
      "error": {
        "code": "INVALID_END_DATE",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Grade not found.",
      "error": {
        "code": "GRADE_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this grade.",
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
      "message": "Error updating grade.",
      "error": {
        "code": "UPDATE_GRADE_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own grade.

#### Update Grade (Partial (JSON Patch))

- **URL:** `/api/grades/:id`
- **Method:** `PATCH` **(JSON Patch - RFC 6902)**

- **Request Parameters**:

  - `id`: The ID of the grade to update.

- **Request Body**:

  ```json
  []
  ```

  > **Note:** The JSON Patch object to update the grade. `/id`, `__v`, `userId`, `createdAt`, and `updatedAt` fields cannot be updated. (Details of the JSON Patch object can be found in the `src/models/gradeSchema.js` file.)

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Grade updated successfully."
    }
    ```

    > **Note:** The updated grade data will be returned in the response (`data` field). The response data will not be detailed.

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid path: <path>.",
      "error": {
        "code": "INVALID_PATH",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Missing 'from' in copy operation.",
      "error": {
        "code": "INVALID_OPERATION",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid from path: <path>.",
      "error": {
        "code": "INVALID_FROM_PATH",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Missing 'from' in move operation.",
      "error": {
        "code": "INVALID_OPERATION",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Test operation failed at path: <path>.",
      "error": {
        "code": "TEST_FAILED",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Unsupported operation: <operation>.",
      "error": {
        "code": "INVALID_OPERATION",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Grade not found.",
      "error": {
        "code": "GRADE_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this grade.",
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
      "message": "Error updating grade fields.",
      "error": {
        "code": "UPDATE_GRADE_FIELDS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own grade.

#### Delete Grade

- **URL:** `/api/grades/:id`
- **Method:** `DELETE`

- **Request Parameters**:

  - `id`: The ID of the grade to delete.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Grade deleted successfully."
    }
    ```

    > **Note:** The deleted grade data will be returned in the response (`data` field).

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Grade not found.",
      "error": {
        "code": "GRADE_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to delete this grade.",
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
      "message": "Error deleting grade.",
      "error": {
        "code": "DELETE_GRADE_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only delete their own grade.

#### Export Grade

- **URL:** `/api/grades/:id/export`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the grade to export.

- **Response**:

  - **Status:** `200 OK`

    > **Note:** The response will be a JSON file with the grade data.

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Grade not found.",
      "error": {
        "code": "GRADE_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to export grade for this user.",
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
      "message": "Error exporting grade.",
      "error": {
        "code": "EXPORT_GRADE_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only export grades for their own account.
