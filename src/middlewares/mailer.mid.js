const nodemailer = require('nodemailer');

const sendEmail = async (mailOptions) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log('error occured');
        }
        else {
            console.log("mail sent!!!")
        }
    });
}

const email = async (subject, text, email) => {
    let options = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: text
    }
    sendEmail(options);
}
module.exports = email