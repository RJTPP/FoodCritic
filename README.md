# FoodCritic 🍽️ ✨

FoodCritic is a FastAPI-based restaurant review web application that allows users to view, review, and manage restaurants. The system includes JWT authentication, role-based access, and a MySQL database. The frontend is built using HTML, JavaScript, and Tailwind CSS, while Docker is used for containerized deployment.

## Table of Contents

- [FoodCritic 🍽️ ✨](#foodcritic-️-)
  - [Table of Contents](#table-of-contents)
  - [🚀 Features](#-features)
    - [User Roles \& Authentication](#user-roles--authentication)
    - [Restaurant \& Review System](#restaurant--review-system)
    - [Secure API \& Database Integration](#secure-api--database-integration)
    - [Frontend](#frontend)
    - [Deployment \& Containerization](#deployment--containerization)
  - [📂 Project Structure](#-project-structure)
  - [🛠️ Installation \& Setup](#️-installation--setup)
    - [1. Prerequisites](#1-prerequisites)
    - [2. Clone the Repository](#2-clone-the-repository)
    - [3. Set Up Environment Variables](#3-set-up-environment-variables)
    - [4. Start the Application (Docker 🐳)](#4-start-the-application-docker-)
    - [5. Running Without Docker (Alternative)](#5-running-without-docker-alternative)
  - [🔑 Authentication \& API Usage](#-authentication--api-usage)
    - [Obtain Access Token (Login)](#obtain-access-token-login)
  - [🔗 API Endpoints](#-api-endpoints)
  - [👨‍💻 Future Enhancements](#-future-enhancements)
  - [⚠️ Security Best Practices](#️-security-best-practices)
  - [📄 License](#-license)


## 🚀 Features
###  User Roles & Authentication
- **Admin:** Can manage all users, restaurants, and system analytics. (Not implemented yet)
- **Restaurant Owner:** Can create and manage multiple restaurants, view reviews.
- **Regular User:** Can browse restaurants, leave reviews, and view ratings.
- **JWT-based authentication** for secure login and access control.

###  Restaurant & Review System
- **Restaurant Management:** Owners can add, edit, and delete restaurants.
- **Review System:** Users can leave **ratings (1-5 stars) and text reviews**.
- **Average ratings** are displayed for each restaurant.

###  Secure API & Database Integration
- **Protected API endpoints** (only authorized users can access sensitive routes).
- **MySQL database** for user, restaurant, and review data.
- **Automated database setup** with `init.sql`.

###  Frontend
- Built with HTML, JavaScript, Tailwind CSS, and Flowbite.
- Responsive design with a user-friendly interface.
- Dynamic content using **JavaScript & API calls**.

###  Deployment & Containerization
- **Docker Compose** for easy local setup.
- Runs in a **FastAPI & MySQL containerized environment**.



## 📂 Project Structure
```
project
┣ init_db/               # SQL script for database initialization
┣ app/
┃ ┣ api/                 # API endpoints
┃ ┣ models/              # Database models
┃ ┣ routers/             # URL route handlers
┃ ┣ schemas/             # Data validation schemas
┃ ┣ static/              # CSS, JS, and images for frontend
┃ ┣ templates/           # HTML templates (Jinja2)
┃ ┣ utils/               # Utility functions (e.g., token authentication)
┃ ┣ config.py            # Configuration settings
┃ ┣ database.py          # Database connection
┃ ┣ main.py              # FastAPI entry point
┃ ┣ .env                 # Environment variables (excluded from Git)
┣ docker-compose.yml     # Docker setup for MySQL and FastAPI
┣ Dockerfile             # Instructions to build FastAPI container
┣ requirements.txt       # Python dependencies
```



## 🛠️ Installation & Setup

### 1. Prerequisites
- Install **Docker** and **Docker Compose**.
- Install **Python 3.10+**.

### 2. Clone the Repository
```sh
git clone https://github.com/yourusername/restaurant-review-app.git
cd restaurant-review-app
```

### 3. Set Up Environment Variables
Copy the example environment file:
```sh
cp .env.example .env
```

Update the **`.env`** file with your database credentials:
```shell
# Database
MYSQL_DATABASE=[restaurant_db]
MYSQL_ROOT_PASSWORD=[ROOTPASSWORD]  
MYSQL_USER=[USERNAME]  
MYSQL_PASSWORD=[PASSWORD]  
DATABASE_URL=mysql+pymysql://admin:[ROOTPASSWORD]@db/[restaurant_db]  
# Token
TOKEN_SECRET=[SECRET_KEY] 
TOKEN_ALGORITHM=HS256
```

### 4. Start the Application (Docker 🐳)
```sh
docker-compose up --build
```
- FastAPI will be running at port **8000**.
- API Documentation (Swagger UI) is available at **/docs** endpoint.
- MySQL will be running at port **3306**

### 5. Running Without Docker (Alternative)
If you want to run the project **without Docker**:
```sh
pip install -r requirements.txt
uvicorn app.main:app --reload
```

> [!NOTE]
> With out Docker, you will need to set up a separate MySQL database and provide the connection details in the `.env` file.


## 🔑 Authentication & API Usage
### Obtain Access Token (Login)
```sh
POST /api/auth/signin
{
  "username": "[USERNAME]",
  "password": "[PASSWORD]"
}
```
Response:
```json
{
  "access_token": "[YOUR_JWT_TOKEN]",
  "token_type": "bearer"
}
```


 ## 🔗 API Endpoints

| Category         | Method | Endpoint                                  | Description |
|-----------------|--------|------------------------------------------|-------------|
| **Authentication** | **POST** | `/api/auth/signin` | Sign in a user |
|                 | **POST** | `/api/auth/signup` | Sign up a new user |
|                 | **GET**  | `/api/auth/verify` | Verify user authentication |
|                 | **GET**  | `/api/auth/redirect` | Handle authentication redirects |
| **Restaurants** | **GET**  | `/api/restaurants` | Get a list of restaurants |
|                 | **GET**  | `/api/restaurants/{id}` | Get details of a specific restaurant |
|                 | **GET**  | `/api/restaurants?search=<query>` | Search restaurants |
|                 | **GET**  | `/api/restaurants/{id}/reviews` | Get reviews for a restaurant |
|                 | **POST** | `/api/restaurants/{id}/reviews` | Submit a review for a restaurant |
| **Reviews**     | **GET**  | `/api/reviews/{review_id}` | Get a specific review |
|                 | **PUT**  | `/api/reviews/{review_id}` | Update a review |
|                 | **DELETE** | `/api/reviews/{review_id}` | Delete a review |
|                 | **GET**  | `/api/reviews/{review_id}/reports` | Get reports for a review |
|                 | **POST** | `/api/reviews/{review_id}/reports` | Report a review |
| **Reports (Admin Only)** | **GET**  | `/api/reports/{reports_id}` | Get a specific report |
|                 | **PUT**  | `/api/reports/{reports_id}` | Update a report status |
| **Manage**      | **GET**  | `/api/manage/` | Retrieve management data |
|                 | **POST** | `/api/manage/` | Create a new management entry |
|                 | **GET**  | `/api/manage?search=<query>` | Search management entries |
|                 | **GET**  | `/api/manage/{id}` | Get details of a management entry |
|                 | **PUT**  | `/api/manage/{id}` | Update a management entry |
|                 | **DELETE** | `/api/manage/{id}` | Delete a management entry |
| **Categories**  | **GET**  | `/api/categories` | Get a list of categories |**


For full documentation, visit: **/docs** endpoint.



## 👨‍💻 Future Enhancements
- Add **Admin Dashboard** for managing restaurants & users.  
- Implement **pagination & sort by** in restaurant listings.  
- Improve **frontend interactivity** using Vue.js or React.  

## ⚠️ Security Best Practices
- Use HTTP-only cookies instead of localStorage for storing JWT tokens.
- Enable HTTPS in production for secure token transmission.
- Use rate limiting to prevent abuse of API endpoints.


## 📄 License
This project is open-source and available under the **MIT License**.

