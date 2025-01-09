
# Node.js Admin Dashboard Application

This is a Node.js-based admin dashboard application using PostgreSQL as the database. It includes features like user authentication, data visualization, and user management.

## Getting Started

Follow these steps to set up and run the application locally.

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [PostgreSQL](https://www.postgresql.org/) installed

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   DB_USER=leopoldweber
   DB_PASSWORD=my_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=my_local_db
   ```

4. **Initialize the database**:
   The database will auto-initialize on server startup using the `db.sql` file. Alternatively, you can manually run:
   ```bash
   psql -U leopoldweber -d my_local_db -f db.sql
   ```

### Running the Application

1. **Start the server**:
   ```bash
   node server.js
   ```

2. **Access the application**:
   Open your browser and navigate to [http://localhost:3001/login.html](http://localhost:3001/login.html).

### Features

- User Authentication (Login/Register)
- Admin Dashboard
- User Management (List/Search Users)
- Charts for Data Visualization

### File Structure

```
.
├── public/           # Static files (HTML, CSS, JS)
├── db.sql            # Database schema and data
├── server.js         # Main server file
├── db.js             # Database connection setup
├── .env              # Environment variables (not included in repo)
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

### Contributing

Feel free to fork this repository and submit pull requests for improvements.

### License

This project is licensed under the MIT License.
