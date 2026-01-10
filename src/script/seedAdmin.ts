import { prisma } from "../lib/prisma";
import { UserRole } from "../types";

const seedAdmin = async () => {
  try {
    //! Check if admin user already exists
    const adminData = {
      name: "Admin 4",
      email: "admin3@example.com",
      password: "securepassword",
      role: UserRole.ADMIN,
    };

    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });
    console.log(existingAdmin);
    if (existingAdmin) throw new Error("User already exists");

    const createAdmin = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      }
    );

    if (createAdmin.ok) {
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
      console.log("Admin user verified successfully");
    }
  } catch (error) {
    console.error(error);
  }
};

seedAdmin();
