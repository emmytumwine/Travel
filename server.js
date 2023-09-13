const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
  server: 'EMMY',
  database: 'Booking_db',
  user: 'sa',
  password: 'emmy',
  options: {
    encrypt: false, // Use encryption if needed
  },
};


// Define an async function to start the server and establish database connections
async function startServer() {
  try {
    // Create ConnectionPool instances for booking and registration databases
    const bookingPool = new sql.ConnectionPool(dbConfig);
    const registrationPool = new sql.ConnectionPool(dbConfig);

    // Connect to the databases
    await bookingPool.connect();
    await registrationPool.connect();

    console.log('Connected to SQL Server');

    // Handle form submission for booking
    app.post('/book_form', async (req, res) => {
      try {
        const {
          firstName,
          lastName,
          email,
          number,
          phone,
          address,
          location,
          guests,
          arrivals,
          leaving,
        } = req.body;

        // Insert the user's details into the booking database
        const bookingRequest = bookingPool
          .request()
          .input('firstName', sql.VarChar, firstName)
          .input('lastName', sql.VarChar, lastName)
          .input('email', sql.VarChar, email)
          .input('number', sql.BigInt, number)
          .input('phone', sql.VarChar, phone)
          .input('address', sql.VarChar, address)
          .input('location', sql.VarChar, location)
          .input('guests', sql.Int, guests)
          .input('arrivals', sql.Date, arrivals)
          .input('leaving', sql.Date, leaving)
          .query(
            'INSERT INTO booking_table ([First Name], [Last Name], Email, [National Id Or Passport], Phone, Address, [Location], [Members], [Arrival], [Leaving]) VALUES (@firstName, @lastName, @email, @number, @phone, @address, @location, @guests, @arrivals, @leaving)'
          );

        await bookingRequest;

        res.send('User details submitted successfully for booking.');
      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during booking.');
      }
    });

    // Handle signup form submission for registration
    app.post('/signup', async (req, res) => {
      try {
        const {
          company_name,
          email_address,
          location,
          phone,
          username,
          password,
        } = req.body;

        // Hash the password before storing it in the registration database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user data into the registration database
        const registrationRequest = registrationPool
          .request()
          .input('company_name', sql.NVarChar, company_name)
          .input('email_address', sql.NVarChar, email_address)
          .input('location', sql.NVarChar, location)
          .input('phone', sql.NVarChar, phone)
          .input('username', sql.NVarChar, username)
          .input('password', sql.NVarChar, hashedPassword)
          .query(
            'INSERT INTO Registration_table ([Company Name], [Email Address], Location, Phone, [User Name], Password) VALUES (@company_name, @email_address, @location, @phone, @username, @password)'
          );

        await registrationRequest;
        res.send('Registration went successfully!.');

      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during Registering.');
      }
    });

    app.use(express.static('Bugufi'));
    // app.use(express.urlencoded({ extended: true }));

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to SQL Server:', error.message);
  }
}

// Call the startServer function to start the server and establish connections
startServer().catch(console.error);

