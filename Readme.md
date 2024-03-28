# Read Me!

### Features:

-   **User Authentication**: Secure user authentication system implemented using JSON Web Tokens (JWT) for user login, registration, and authorization.
-   **Product Management**: CRUD operations for managing products, including creation, retrieval, updating, and deletion.
-   **Order Processing**: Functionality for processing orders, including creation, retrieval, and updating of orders.
-   **Cart Management**: Ability to add, update, and remove items from the shopping cart.
-   **Payment Integration**: Integration with payment gateways for processing transactions securely.
-   **Middleware**: Middleware functions implemented for authentication and error handling.
-   **RESTful APIs**: RESTful APIs designed for seamless interaction with the frontend.

### Technologies Used:

-   **MongoDB**: NoSQL database for storing product, user, and order data.
-   **Express.js**: Web application framework for Node.js used for building the backend server and APIs.
-   **React.js**: JavaScript library for building user interfaces.
-   **Node.js**: JavaScript runtime environment for executing backend code.
-   **JWT**: JSON Web Tokens for secure authentication and authorization.
-   **Express Validator**: Middleware for input validation.
-   **Mongoose**: MongoDB object modeling tool for Node.js.
-   **Stripe**: Payment processing platform for handling transactions securely.

# Install Dependencies
- **Backend**: npm i && npm run build

# ENV Vars
- Go through the code once and add a file **.env** with all the env vars info. 
- **process.env.ENV_VAR_NAME**  - This is how you know that env var is used there. 
