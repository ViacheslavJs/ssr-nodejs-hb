const nodemailer = require('nodemailer');
require('dotenv').config();

// Настройка транспорта для отправки email
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// Функция для отправки письма
const sendOrderEmail = (customerName, customerEmail, subject, text, html) => {
    const mailOptions = {
        from: `${customerName} <${process.env.EMAIL}>`, // Имя отправителя и email отправителя
        to: process.env.EMAIL, // Email получателя, где вы будете получать заказы
        replyTo: `${customerEmail}`, // Укажите реальный email для ответов        
        subject: subject,
        text: text,
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Ошибка при отправке письма:', error.message);
        } else {
            console.log('Письмо успешно отправлено!');
            console.log('ID письма в очереди:', info.messageId);
            console.log('Ответ SMTP сервера:', info.response);
        }
    });
};

module.exports = { sendOrderEmail };

