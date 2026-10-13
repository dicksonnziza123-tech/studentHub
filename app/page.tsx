
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  course: string;
  created_at: string;
};

type StudentsResponse = {
  success: boolean;
  students?: Student[];
  message?: string;
};

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load students from our backend API
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/students");
      const data: StudentsResponse = await response.json();

      if (!response.ok || !data.success || !data.students) {
        throw new Error(data.message || "Could not load students.");
      }

      setStudents(data.students);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  // Validate and register a student
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCourse = course.trim();

    if (
      !cleanFirstName ||
      !cleanLastName ||
      !cleanEmail ||
      !cleanCourse
    ) {
      setError("Please complete all four fields.");
      return;
    }

    if (
      cleanFirstName.length > 100 ||
      cleanLastName.length > 100 ||
      cleanEmail.length > 150 ||
      cleanCourse.length > 100
    ) {
      setError("Please check the length of each field.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: cleanFirstName,
          last_name: cleanLastName,
          email: cleanEmail,
          course: cleanCourse,
        }),
      });

     const text = await response.text();

let data: { success: boolean; message: string };

try {
  data = JSON.parse(text) as {
    success: boolean;
    message: string;
  };
} catch {
  throw new Error(
    `Registration returned an invalid response (HTTP ${response.status}). Check the VS Code terminal.`
  );
}
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not register student.");
      }

      setMessage("Student registered successfully!");

      setFirstName("");
      setLastName("");
      setEmail("");
      setCourse("");

      // Refresh the table after successful registration
      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register student."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <header className="mb-8">
          <p className="font-semibold text-blue-600">
            STUDENT MANAGEMENT SYSTEM
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            StudentHub 
          </h1>
          <p className="mt-3 text-slate-600">
            Register students and manage your student records.
          </p>
        </header>

        {/* Summary card */}
        <section className="mb-8 rounded-2xl bg-blue-700 p-6 text-white shadow-sm">
          <p className="text-sm text-blue-100">Total registered students</p>
          <p className="mt-2 text-4xl font-bold">
            {loading ? "..." : students.length}
          </p>
        </section>

        {/* Registration form */}
        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold">Register a student</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter the student's information below.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  name="first_name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  maxLength={100}
                  autoComplete="given-name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  name="last_name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  maxLength={100}
                  autoComplete="family-name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={150}
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="course"
                  className="mb-2 block text-sm font-medium"
                >
                  Course
                </label>
                <input
                  id="course"
                  name="course"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Software Development"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Registering..." : "Register student"}
            </button>
          </form>
        </section>

        {/* Student list */}
        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Registered students</h2>
              <p className="mt-1 text-sm text-slate-500">
                Student records retrieved from your database.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadStudents()}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              Refresh list
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Course</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No students yet. Register your first student above!
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">{student.id}</td>
                      <td className="px-4 py-4 font-medium">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-4 py-4">{student.email}</td>
                      <td className="px-4 py-4">{student.course}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-8 text-center text-sm text-slate-500">
          StudentHub · Built with Next.js, TypeScript, and MariaDB
        </footer>
      </div>
    </main>
  );
}
