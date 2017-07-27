# Ganymed Projekt

### You'll need

1. [NodeJS](https://nodejs.org/en/download/) v6.9.4 or higher


### Setup

1. Git Clone
2. `npm i `
3. `node app.js` (or `nodemon .`, if installed)

### Database

To get the database running, you have 3 options:
1. Use the dump file ("Ganymed_Dump.sql") to recreate the database.
2. Use the file "ganymed.sql" to create the correct Schema.
3. Start the application and use the API endpoint "/api/debug/reset" with a GET request to initialise or reset the database.

The database has to be running on localhost:3306. If this is not the case, the settings in the files `/components/routes/api.js` and `/components/routes/api.js` need to be adjusted.
