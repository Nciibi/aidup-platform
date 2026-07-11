// In-memory store for pending registrations
// Note: In production, consider using Redis or a proper database
const pendingRegistrations = new Map();
console.log("pendingRegistrations",pendingRegistrations)
module.exports = pendingRegistrations;
