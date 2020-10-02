module.exports = (request, response, next) => {
    response.status(404).json({ message: 'Not Found' });
};