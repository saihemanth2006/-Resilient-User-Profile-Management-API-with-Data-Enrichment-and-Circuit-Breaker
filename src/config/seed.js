async function seedUsers(pool) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute('SELECT COUNT(*) AS count FROM users');
    if (rows[0].count > 0) {
      return;
    }

    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO users (id, name, email, registration_date) VALUES
      (?, ?, ?, ?),
      (?, ?, ?, ?),
      (?, ?, ?, ?)`,
      [
        'user-1', 'Alice Wonderland', 'alice@example.com', '2023-01-15T10:00:00.000Z',
        'user-2', 'Bob The Builder', 'bob@example.com', '2023-01-16T11:30:00.000Z',
        'user-3', 'Charlie Chaplin', 'charlie@example.com', '2023-01-17T14:00:00.000Z',
      ],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = seedUsers;
