# How to Run the Loan Tracker Application

## Prerequisites

1. **Java 21** - Install JDK 21
2. **Node.js 18+** - Install Node.js (v18 or higher)
3. **PostgreSQL** - Install and run PostgreSQL server
4. **Maven** - For building/running the backend (or use Maven wrapper)
5. **npm/yarn/pnpm** - For frontend dependencies

---

## Step 1: Set Up PostgreSQL Database

1. **Start PostgreSQL service** (if not already running)

2. **Create the database:**
   ```sql
   CREATE DATABASE loan_tracker;
   ```

3. **Update database credentials** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

---

## Step 2: Run the Backend (Spring Boot)

### Option A: Using Maven (Recommended)

1. **Navigate to project root:**
   ```bash
   cd "C:\Users\Abet Caro\Desktop\CMSC127 MP\CMSC127-Loan-Tracker"
   ```

2. **Install dependencies and run:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Or in one command:
   ```bash
   mvn clean spring-boot:run
   ```

### Option B: Using IDE (IntelliJ IDEA / Eclipse)

1. Open the project in your IDE
2. Locate `ProjectApplication.java` in `src/main/java/com/example/project/`
3. Right-click → Run `ProjectApplication`

### Verify Backend is Running

- Backend should start on **http://localhost:8080**
- Check console for: `Started ProjectApplication`
- Test: Open **http://localhost:8080/swagger-ui.html** (Swagger API docs)
- Test API: **http://localhost:8080/api/persons** (should return empty array or data)

---

## Step 3: Run the Frontend (React/Vite)

**Note:** Frontend is configured to run on port **8081** (backend uses 8080). CORS is already configured.

1. **Install frontend dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

### Verify Frontend is Running

- Frontend should start on **http://localhost:8081** (or the port you configured)
- Open browser to see the Loan Tracker app

---

## Step 4: Verify Everything Works

1. **Backend Health Check:**
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - API Test: http://localhost:8080/api/persons
   - API Test: http://localhost:8080/api/groups

2. **Frontend Health Check:**
   - Open: http://localhost:8081
   - Check browser console for any errors
   - Try creating a contact/person

3. **Integration Test:**
   - Create a person in the frontend
   - Check if it appears in backend API: http://localhost:8080/api/persons
   - Create a loan entry
   - Check database or API to verify it was saved

---

## Troubleshooting

### Backend Issues

**Port 8080 already in use:**
- Change backend port in `application.properties`:
  ```properties
  server.port=8082
  ```
- Update frontend API calls to use new port

**Database connection error:**
- Verify PostgreSQL is running
- Check credentials in `application.properties`
- Ensure database `loan_tracker` exists

**Maven build fails:**
- Run `mvn clean` first
- Check Java version: `java -version` (should be 21)
- Ensure Maven is installed: `mvn -version`

### Frontend Issues

**Port conflict:**
- Change Vite port in `vite.config.ts` to 8081 or 5173
- Update CORS in backend to match

**API connection errors:**
- Verify backend is running on port 8080
- Check browser console for CORS errors
- Verify API URL in frontend code matches backend port

**Module not found errors:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## Quick Start Commands

### Terminal 1 (Backend):
```bash
cd "C:\Users\Abet Caro\Desktop\CMSC127 MP\CMSC127-Loan-Tracker"
mvn spring-boot:run
```

### Terminal 2 (Frontend):
```bash
cd "C:\Users\Abet Caro\Desktop\CMSC127 MP\CMSC127-Loan-Tracker"
npm run dev
```

---

## Production Build

### Build Backend:
```bash
mvn clean package
java -jar target/project-0.0.1-SNAPSHOT.jar
```

### Build Frontend:
```bash
npm run build
npm run preview  # Preview production build
```

---

## Default Ports

- **Backend API:** http://localhost:8080
- **Frontend App:** http://localhost:8081 (or 5173)
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **API Base URL:** http://localhost:8080/api

---

## Database Schema

The database schema will be **automatically created** by Hibernate on first run (due to `spring.jpa.hibernate.ddl-auto=update`).

Tables created:
- `persons`
- `user_groups`
- `group_members`
- `loan_entries`
- `installment_details`
- `payment_records`
- `payment_allocations`

---

## Need Help?

- Check console logs for errors
- Verify all prerequisites are installed
- Ensure PostgreSQL is running
- Check that ports are not in use by other applications

