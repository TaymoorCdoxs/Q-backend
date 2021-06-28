exports.hospitalSeeder = async (req, res, next) => {


    try {



    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            error: err.message
        })
    }
}

let getUsersArray = async () => {
    let users = [{
        name: 'John',
        email: 'john@gmail.com',
    },
    ]
}