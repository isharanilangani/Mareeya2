# Getting Started with Vehicle Mangament system

This project is a React-based application with functionalities like charts, file uploading, date pickers, and routing.

## **Features**

- **Axios**: For making HTTP requests.
- **Chart.js and react-chartjs-2**: For creating interactive charts.
- **Cropper.js and react-cropper**: For cropping images.
- **React Icons**: For adding scalable vector icons.
- **Font Awesome**: For additional icon support.
- **React Router DOM**: For client-side routing.
- **Multer**: For handling file uploads.
- **React Datepicker**: For selecting dates in forms.

## **Prerequisites**

Ensure you have the following installed:

- **Node.js** (version 16.x or higher): [Download Node.js](https://nodejs.org/)
- **npm** (Node Package Manager): Comes bundled with Node.js

## **Setup Instructions**

### Step 1: Clone the Repository

1. Open your terminal and navigate to the directory where you want to clone the project.
2. Run the following command:
   ```bash
   git clone <repository-url>

3. Navigate to the project folder
4. Database Setup
    - Open your MySQL client (MySQL Workbench, phpMyAdmin, or terminal).
    - CREATE DATABASE mareeya;
    - mysql -u <your-username> -p app_database_name < backend/database/mareeya(1).sql  
5. Backend Setup
    - cd backend
    - npm install
    - npm install bcrypt@^5.1.1 body-parser@^1.20.3 cors@^2.8.5 dotenv@^16.4.5 express@^4.21.1 jsonwebtoken@^9.0.2 moment@^2.30.1 mysql2@^3.11.4
    - npm start
    - http://localhost:10000  
6. Frontend Setup
   - npm install
   - npm install axios@^1.7.9 chart.js@^4.4.7 cra-template@1.2.0 cropperjs@^1.6.2 font-awesome@^4.7.0 multer@^1.4.5-lts.1 react@^18.3.1 react-chartjs-2@^5.2.0 react-cropper@^2.3.3 react-datepicker@^7.5.0 react-dom@^18.3.1 react-icons@^5.4.0 react-router-dom@^7.0.2 react-scripts@5.0.1 web-vitals@^4.2.4
    - npm start
    - http://localhost:3000

## **Project Dependencies**

axios: HTTP client for API communication.
chart.js: For creating charts.
cra-template: React template for create-react-app.
cropperjs: For image cropping.
font-awesome: Icon library.
multer: Middleware for handling file uploads.
react: React library for building UI.
react-chartjs-2: React wrapper for Chart.js.
react-cropper: React wrapper for Cropper.js.
react-datepicker: Date picker component for React.
react-dom: React library for DOM rendering.
react-icons: Icon library for React.
react-router-dom: Routing library for React.
react-scripts: Scripts for building React apps.
web-vitals: For measuring performance.

## **Scripts**

npm start: Starts the development server.
npm run build: Builds the app for production.
npm test: Launches the test runner

## **Troubleshooting**

Ensure all dependencies are installed with npm install.
Verify that Node.js and npm are installed and up to date.
If the development server doesn't start, check for conflicts on port 3000.
