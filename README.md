# ?? Journal Entry System – Setup Guide

This project uses **SQL Server Database First** approach.  
Follow the steps below to run the project locally.

---

## ?? 1. Requirements

Make sure the following are installed:

- **.NET SDK 7.0+**
- **Visual Studio 2022** or **VS Code**
- **SQL Server**
- **SQL Server Management Studio (SSMS)**

---

## ??? 2. Database Setup

The project uses an existing SQL Server database.  
You must **create the database** before running the app.

Steps:

1. Open SSMS  
2. Create an empty database named: fCarePlus

```## ???  Required Database Tables:
The project depends on three tables:

AccountsChart

JournalEntry

JournalEntryDetail

 Run SQL scripts in the following order (all scripts are in `/sql commands/` folder):

   1. **AccountsChart.sql** ? creates `AccountsChart` table and inserts initial seed data **(must run first!)**  
   2. **SQLQuery9.sql** ? creates both `JournalEntry` and `JournalEntryDetail` tables
```

3. Update the Connection String:
```
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=fCarePlus;Trusted_Connection=True;TrustServerCertificate=True;"
}
```
### Replace YOUR_SERVER_NAME with your local SQL Server instance

4. Running the Project
``` After completing database setup:

Open the project in Visual Studio or VS Code

Run dotnet restore (if needed)

Ensure the API starts correctly

Launch the AngularJS: https://localhost:7088/JournalEntry.html

The system will load accounts and allow you to test journal entries locally
```