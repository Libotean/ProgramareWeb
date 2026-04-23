const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'users.json');

const getUsers = () => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Eroare la citirea utilizatorilor:", err);
        return [];
    }
};

const saveUser = (user) => {
    const users = getUsers();
    users.push(user);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

module.exports = { getUsers, saveUser };