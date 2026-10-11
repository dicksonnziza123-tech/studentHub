
import { NextResponse } from "next/server";
import { createStudent, listStudents } from "@/lib/db";

export async function GET() {
  try {
    const students = await listStudents();

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Failed to fetch students:", error);

    return NextResponse.json(
      { success: false, message: "Could not retrieve students." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Request body is required." },
        { status: 400 }
      );
    }

    const firstName =
      typeof body.first_name === "string" ? body.first_name.trim() : "";
    const lastName =
      typeof body.last_name === "string" ? body.last_name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const course =
      typeof body.course === "string" ? body.course.trim() : "";

    if (!firstName || !lastName || !email || !course) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (
      firstName.length > 100 ||
      lastName.length > 100 ||
      email.length > 150 ||
      course.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { success: false, message: "Please check your input." },
        { status: 400 }
      );
    }

    const student = await createStudent(firstName, lastName, email, course);

    return NextResponse.json(
      {
        success: true,
        message: "Student registered successfully!",
        student,
      },
      { status: 201 }
    );
  } catch (error) {
    const dbError = error as { code?: string };

    if (dbError.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "This email is already registered." },
        { status: 409 }
      );
    }

    console.error("Failed to register student:", error);

    return NextResponse.json(
      { success: false, message: "Could not register student." },
      { status: 500 }
    );
  }
}
