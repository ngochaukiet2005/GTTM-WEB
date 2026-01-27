const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./configs/env');
const connectDB = require('./configs/database');
const errorHandler = require("./middlewares/errorHandle.middleware");
const Route = require("./routes/index.route");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

(async () => {
    try {
        // connect database
        await connectDB();

        // init routes
        app.use("/api", Route);

        // root routes for testing
        app.get('/', (req, res) => {
            res.json({ message: 'Welcome to Smart Shuttle Dispatch System API' });
        });

        app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok', uptime: process.uptime() });
        });

        // error handler (should be last)
        app.use(errorHandler);

        // start server
        app.listen(env.port, () => {
            console.log(`🚀 Server running on port ${env.port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();
