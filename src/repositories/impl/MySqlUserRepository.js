const { ValidationError } = require('../../utils/errors');

class MySqlUserRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async create(user) {
    await this.connection.execute(
      'INSERT INTO users (id, name, email, registration_date) VALUES (?, ?, ?, ?)',
      [user.id, user.name, user.email, user.registrationDate],
    );
    return user;
  }

  async findById(id) {
    const [rows] = await this.connection.execute('SELECT id, name, email, registration_date AS registrationDate FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await this.connection.execute('SELECT id, name, email, registration_date AS registrationDate FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async findAll() {
    const [rows] = await this.connection.execute('SELECT id, name, email, registration_date AS registrationDate FROM users ORDER BY registration_date DESC');
    return rows;
  }

  async update(id, updates) {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }

    if (fields.length === 0) {
      throw new ValidationError('No updatable fields provided');
    }

    values.push(id);
    const [result] = await this.connection.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) {
      return null;
    }
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await this.connection.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = MySqlUserRepository;
