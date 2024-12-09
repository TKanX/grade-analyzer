# GradeAnalyzer

GradeAnalyzer is a powerful and user-friendly tool designed to help students track, analyze, and improve their academic performance. With features such as GPA calculation, performance tracking, and goal-setting, this tool provides an in-depth understanding of academic progress, allowing students to set and achieve their educational goals efficiently.

> This project is structured as a **full-stack application** with separate **frontend** and **backend** components.

## Features

- **Multi-Level Data Input:** Supports input at different levels (task, category, subject), allowing flexibility for different user preferences.
- **GPA Calculation (Weighted & Unweighted):** Automatically calculates GPA based on weighted or unweighted methods, taking into account advanced courses like AP and Honors.
- **Performance Visualization:** Interactive charts and graphs (pie charts, bar charts, line graphs) to display performance across subjects, categories, and tasks.
- **Goal Setting:** Set and track academic goals such as GPA targets, subject-specific goals, and category-specific targets.
- **User-Friendly Interface:** Clean and intuitive design to ensure easy navigation and data input.

## Prerequisites

- Node.js
- MongoDB
- SMTP Server (for sending emails)
- Nginx (for reverse proxy)

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, JWT, Nodemailer
- **Frontend:** Node.js, Express, EJS, Tailwind CSS, Chart.js

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TKanX/grade-analyzer.git && cd grade-analyzer
   ```

2. **Setup the backend**

   1. Create a `.env` file in the `backend` directory and add the following environment variables:

      ```env
      PORT=5000 # Port number for the server (default: 5000)
      HOST=localhost # Host address for the server (default: localhost)
      MONGODB_URI=mongodb://localhost:27017/grade-analyzer # MongoDB connection URI
      JWT_SECRET=secret # Secret key for JWT token generation
      SMTP_HOST=smtp.gmail.com # SMTP server host
      SMTP_PORT=587 # SMTP server port
      SMTP_SECURE=false # SMTP secure connection (default: false)
      SMTP_USERNAME=user # SMTP username
      SMTP_PASSWORD=pass # SMTP password
      SMTP_SENDER=no-reply@example.com # Email sender address
      ```

      > **Note:** The SMTP host, port, username, password, and sender address should be replaced with your own SMTP server details.

   2. **Install the dependencies**

      ```bash
      cd backend # Move to the backend directory
      npm install # Install the dependencies
      ```

   3. **Start the backend server**

      ```bash
      npm start # Start the backend server
      ```

3. **Setup the frontend**

   1. Create a `.env` file in the `frontend` directory and add the following environment variables:

      ```env
      PORT=3000 # Port number for the server (default: 3000)
      HOST=localhost # Host address for the server (default: localhost)
      ```

   2. **Install the dependencies**

      ```bash
      cd ../frontend # Move to the frontend directory
      npm install # Install the dependencies
      ```

   3. **Build the Tailwind CSS**

      ```bash
      npm run build:css # Build the Tailwind CSS
      ```

   4. **Start the frontend server**

      ```bash
      npm start # Start the frontend server
      ```

   > **Note:** The configuration to connect to the backend server is already set in the frontend application. If you want to change the backend server address, configure the server URL in the `frontend/public/js/app.js` file (Default: `/api`).

4. **Setup Nginx**

   1. Configure Nginx as a reverse proxy `/api` to the backend server. (Default: `http://localhost:5000`)
   2. Configure Nginx to serve the frontend application. (Default: `http://localhost:3000`)
   3. Restart Nginx to apply the changes.

5. **Access the application**

   Open the browser and navigate to the server address to `http://localhost` to access the GradeAnalyzer application. (Use the configured Nginx server address if applicable)

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
