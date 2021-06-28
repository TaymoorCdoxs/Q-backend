const express = require('express');
const BodyParser = require('body-parser');
const session = require('express-session');
var faker = require('faker');
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const app = express();

// Static Middlewares
app.use("/assets", express.static("assets"));
// Route imports
const Routes = {
    authRouter: require('./src/routes/auth.route'),
    business_TypeRouter: require('./src/routes/businesstype.route'),
    businessRouter: require('./src/routes/business.route'),
    restaurantRouter: require('./src/routes/Restaurant/restaurant.route'),
    employeesRouter: require('./src/routes/employees/employees.route'),
    tablesRouter: require('./src/routes/Restaurant/table.route'),
    menuRouter: require('./src/routes/Restaurant/menu.route'),
    takeAwayRouter: require('./src/routes/Restaurant/take_away.route'),
    corporateRouter: require('./src/routes/corporate/corporate.route'),
    adminRouter: require('./src/routes/admin/admin.route')
}
// DB Connection
require('./src/database/connection');
// middlewares
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan("dev"));
}
// X-Frams-Options
var helmet = require('helmet');
app.use(helmet.frameguard({ action: "DENY" }));
// cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

// API Routes
app.use('/api/auth', Routes.authRouter);
app.use('/api/business-type', Routes.business_TypeRouter);
app.use('/api/business', Routes.businessRouter);
app.use('/api/restaurant', Routes.restaurantRouter);
app.use('/api/employees', Routes.employeesRouter);
app.use('/api/tables', Routes.tablesRouter);
app.use('/api/menu', Routes.menuRouter);
app.use('/api/take-away', Routes.takeAwayRouter);
app.use('/api/corporate', Routes.corporateRouter);
app.use('/api/admin', Routes.adminRouter);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, (req, res) => {
    console.log(`listening to requests on port ${PORT}`);
});

// handle Unhandled promise rejections
process.on("unhandledRejection", (err, promise, next) => {
    console.log(`Error: ${err.message}`);
    // CLose server and exit process
    // server.close(() => process.exit(1));
});