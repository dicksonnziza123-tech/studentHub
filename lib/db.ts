
import mysql from "mysql2/promise";

export type StudentRecord = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  course: string;
  created_at: string;
};

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "studenthub_db",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

const inMemoryStudents: StudentRecord[] = [];

async function isDatabaseAvailable() {
  try {
    await pool.getConnection();
    return true;
  } catch {
    return false;
  }
}

export async function ensureStudentTable() {
  if (!(await isDatabaseAvailable())) {
    return;
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      course VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
}

export async function listStudents(): Promise<StudentRecord[]> {
  try {
    await ensureStudentTable();
    const [rows] = await pool.execute(
      `SELECT id, first_name, last_name, email, course, created_at
       FROM students
       ORDER BY id DESC`
    );

    return rows as StudentRecord[];
  } catch {
    return [...inMemoryStudents].sort((a, b) => b.id - a.id);
  }
}

export async function createStudent(
  firstName: string,
  lastName: string,
  email: string,
  course: string
): Promise<StudentRecord> {
  try {
    await ensureStudentTable();
    const [result] = await pool.execute(
      `INSERT INTO students (first_name, last_name, email, course)
       VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, course]
    );

    return {
      id: Number((result as { insertId?: number }).insertId ?? 0),
      first_name: firstName,
      last_name: lastName,
      email,
      course,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    const databaseError = error as { code?: string };

    if (databaseError.code === "ER_DUP_ENTRY") {
      throw error;
    }

    if (inMemoryStudents.some((student) => student.email === email)) {
      const duplicateError = new Error("This email is already registered.") as Error & { code?: string };
      duplicateError.code = "ER_DUP_ENTRY";
      throw duplicateError;
    }

    const record: StudentRecord = {
      id:
        inMemoryStudents.length === 0
          ? 1
          : Math.max(...inMemoryStudents.map((student) => student.id)) + 1,
      first_name: firstName,
      last_name: lastName,
      email,
      course,
      created_at: new Date().toISOString(),
    };

    inMemoryStudents.unshift(record);
    return record;
  }
}

export default pool;
