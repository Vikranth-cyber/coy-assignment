```markdown
# Coy - Discover Tab (Part B Assignment)

A mobile-first, full-stack swipe-based discovery feature built as a standalone module alongside Coy's existing experience. It features persistent data storage, mutual matching logic, desktop and mobile gesture controls, and a sleek, modern UI.

## 🚀 Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Lucide React (Mobile-first responsive design)
- **Backend:** Node.js, Express, CORS
- **Data Persistence:** Local JSON file storage (`data.json`) with pre-seeded mock profiles

---

## 🛠️ Prerequisites & Installation

Before running this project locally, ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (Node Package Manager, comes bundled with Node.js)

You can verify your installation by running these commands in your terminal:
```bash
node -v
npm -v

```

---

## 📦 How to Run Locally

To run this full-stack application, you will need to open **two separate terminal windows** (one for the backend server and one for the frontend client).

### Step 1: Clone the Repository

```bash
git clone [https://github.com/Vikranth-cyber/coy-assignment.git](https://github.com/Vikranth-cyber/coy-assignment.git)
cd coy-assignment

```

### Step 2: Set Up & Run the Backend

1. Navigate to the backend directory:
```bash
cd backend

```


2. Install dependencies:
```bash
npm install

```


3. Start the backend server:
```bash
node server.js

```


*The backend server will start running on `http://localhost:5000`.*

### Step 3: Set Up & Run the Frontend

1. Open a **new terminal window** and navigate to the frontend directory from the root folder:
```bash
cd frontend

```


2. Install dependencies:
```bash
npm install

```


3. Start the development server:
```bash
npm run dev

```


4. Open the local URL provided in your terminal (typically `http://localhost:5173`) in your browser to view and test the app.

---

## ✨ Features Implemented

1. **30 Seeded Mock Profiles:** Includes name, age, placeholder photos, bios, city, and interests.
2. **Interactive Swipe Experience:**
* Swipe right to like, swipe left to pass.
* Supports touch/mouse drag gestures on mobile & desktop alongside action buttons.
* Swiped profiles never reappear.


3. **Smart Matching Mechanism:**
* Mutual match triggers an *"It's a Match!"* popup.
* Dedicated **Matches** view listing all mutual connections.
* Strictly hides who liked you unless it is mutual (upholding Coy's core promise).


4. **Persistent State:** Swipes, likes, and matches persist across browser page reloads.

```
