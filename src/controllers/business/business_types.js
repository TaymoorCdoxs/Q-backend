const checkEmpty = require('../../middlewares/checkEmpty.mid');
const BusinessType = require('../../models/Business_type.model');

exports.createBusinessType = async (req, res, next) => {
    try {
        let { name } = req.body;
        if (checkEmpty(name) === true) {
            res.status(200).json({
                status: 400,
                message: "Please provide name to register a new business type"
            })
        } else {
            const check_business = await BusinessType.findAll({ where: { name: name } })
            const business_type = await BusinessType.create({
                name: name
            });
            res.status(200).json({
                status: 200,
                message: "Business type registered"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while creating Business Type"
        })
    }
}

exports.viewBusinessTypes = async (req, res, next) => {
    try {
        const check_business = await BusinessType.findAll();
        res.status(200).json({
            status: 200,
            business_types: check_business
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while creating Business Type"
        })
    }
}