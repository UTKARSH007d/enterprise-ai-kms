"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "",
  });


  // ==========================================================
  // LOAD PAGE
  // ==========================================================

  useEffect(() => {
    loadPage();
  }, []);


  async function loadPage() {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      window.location.href = "/";
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/";
      return;
    }

    // Only Admin and Super Admin can access this page
    if (
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      window.location.href = "/dashboard";
      return;
    }

    setCurrentUser(user);

    await Promise.all([
      fetchUsers(token),
      fetchDepartments(token),
    ]);

    setLoading(false);
  }


  // ==========================================================
  // FETCH USERS
  // ==========================================================

  async function fetchUsers(token) {
    try {
      const response = await fetch(
        `${API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/dashboard";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();

      setUsers(data);

    } catch (err) {
      console.error(err);
      setError("Could not load users.");
    }
  }


  // ==========================================================
  // FETCH DEPARTMENTS
  // ==========================================================

  async function fetchDepartments(token) {
    try {
      const response = await fetch(
        `${API_URL}/admin/departments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/dashboard";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load departments");
      }

      const data = await response.json();

      setDepartments(data);

    } catch (err) {
      console.error(err);
      setError("Could not load departments.");
    }
  }


  // ==========================================================
  // CREATE USER
  // ==========================================================

  async function createUser(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/admin/users`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            department_id: Number(
              form.department_id
            ),
          }),
        }
      );


      const data = await response.json();


      if (response.status === 401) {
        window.location.href = "/";
        return;
      }


      if (response.status === 403) {
        setError(
          data.detail ||
          "You do not have permission to create users."
        );
        return;
      }


      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to create user"
        );
      }


      // New users are ALWAYS employees
      setMessage(
        `Employee ${form.email} created successfully.`
      );


      // Reset form
      setForm({
        name: "",
        email: "",
        password: "",
        department_id: "",
      });


      // Hide form
      setShowForm(false);


      // Refresh users
      await fetchUsers(token);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Could not create user."
      );
    }
  }


  // ==========================================================
  // PROMOTE EMPLOYEE → ADMIN
  // ONLY SUPER ADMIN
  // ==========================================================

  async function promoteUser(userId) {

    if (
      !currentUser ||
      currentUser.role !== "super_admin"
    ) {
      setError(
        "Only Super Admin can promote users."
      );
      return;
    }

    const token = localStorage.getItem("access_token");

    try {

      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/admin/users/${userId}/promote`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to promote user"
        );
      }


      setMessage(
        "User promoted to Admin successfully."
      );


      await fetchUsers(token);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Could not promote user."
      );
    }
  }


  // ==========================================================
  // DEMOTE ADMIN → EMPLOYEE
  // ONLY SUPER ADMIN
  // ==========================================================

  async function demoteUser(userId) {

    if (
      !currentUser ||
      currentUser.role !== "super_admin"
    ) {
      setError(
        "Only Super Admin can demote users."
      );
      return;
    }

    const token = localStorage.getItem("access_token");

    try {

      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/admin/users/${userId}/demote`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to demote user"
        );
      }


      setMessage(
        "Admin demoted to Employee successfully."
      );


      await fetchUsers(token);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Could not demote user."
      );
    }
  }


  // ==========================================================
  // DELETE USER
  // ==========================================================

  async function deleteUser(userId) {

    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/";
      return;
    }


    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }


    try {

      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to delete user"
        );
      }


      setMessage(
        "User deleted successfully."
      );


      await fetchUsers(token);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Could not delete user."
      );
    }
  }


  // ==========================================================
  // DEPARTMENT NAME
  // ==========================================================

  function getDepartmentName(
    departmentId
  ) {

    const department =
      departments.find(
        (department) =>
          department.id === departmentId
      );

    return department
      ? department.name
      : "Company-wide";
  }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="flex min-h-screen items-center justify-center">

          <div className="text-slate-400">
            Loading users...
          </div>

        </div>

      </main>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <section className="p-6 md:p-10">


        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-4xl font-bold">
              User Management
            </h1>

            <p className="mt-2 text-slate-400">
              Manage organization users,
              departments and administrator access.
            </p>

          </div>


          <button
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setMessage("");
            }}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            {showForm
              ? "Cancel"
              : "+ Add User"}
          </button>

        </div>


        {/* ================================================== */}
        {/* SUCCESS MESSAGE */}
        {/* ================================================== */}

        {message && (

          <div className="mb-6 rounded-xl border border-green-800 bg-green-950/30 p-4 text-green-300">

            {message}

          </div>

        )}


        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (

          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-300">

            {error}

          </div>

        )}


        {/* ================================================== */}
        {/* CREATE USER FORM */}
        {/* ================================================== */}

        {showForm && (

          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <h2 className="mb-6 text-xl font-semibold">
              Create New User
            </h2>


            <form
              onSubmit={createUser}
              className="grid gap-5 md:grid-cols-2"
            >


              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="John Doe"
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Email
                </label>

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="john@company.com"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Password
                </label>

                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Password"
                />

              </div>


              {/* DEPARTMENT */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Department
                </label>

                <select
                  required
                  value={form.department_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      department_id:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select department
                  </option>

                  {departments.map(
                    (department) => (

                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ROLE - DISPLAY ONLY */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Role
                </label>

                <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-blue-300">
                  Employee
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  New users are created as Employees.
                  Only Super Admin can promote an Employee
                  to Admin.
                </p>

              </div>


              {/* BUTTON */}

              <div className="flex items-end">

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                >
                  Create Employee
                </button>

              </div>

            </form>

          </div>

        )}


        {/* ================================================== */}
        {/* USERS TABLE */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">


          {/* TABLE HEADER */}

          <div className="border-b border-slate-800 p-6">

            <h2 className="text-xl font-semibold">
              Organization Users
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {users.length} registered users
            </p>

          </div>


          {/* EMPTY */}

          {users.length === 0 ? (

            <div className="p-8 text-center text-slate-400">
              No users found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-800 text-left text-sm text-slate-400">

                    <th className="px-6 py-4">
                      Name
                    </th>

                    <th className="px-6 py-4">
                      Email
                    </th>

                    <th className="px-6 py-4">
                      Role
                    </th>

                    <th className="px-6 py-4">
                      Department
                    </th>

                    <th className="px-6 py-4">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {users.map((user) => (

                    <tr
                      key={user.id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                    >


                      {/* NAME */}

                      <td className="px-6 py-5 font-medium">
                        {user.name}
                      </td>


                      {/* EMAIL */}

                      <td className="px-6 py-5 text-slate-400">
                        {user.email}
                      </td>


                      {/* ROLE */}

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            user.role === "super_admin"
                              ? "bg-purple-900/50 text-purple-300"
                              : user.role === "admin"
                              ? "bg-blue-900/50 text-blue-300"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {user.role === "super_admin"
                            ? "Super Admin"
                            : user.role === "admin"
                            ? "Admin"
                            : "Employee"}
                        </span>

                      </td>


                      {/* DEPARTMENT */}

                      <td className="px-6 py-5 text-slate-400">

                        {getDepartmentName(
                          user.department_id
                        )}

                      </td>


                      {/* ACTION */}

                      <td className="px-6 py-5">

                        <div className="flex flex-wrap gap-2">


                          {/* SUPER ADMIN ACTIONS */}

                          {currentUser?.role ===
                            "super_admin" && (

                            <>
                              {user.role ===
                                "employee" && (

                                <button
                                  onClick={() =>
                                    promoteUser(
                                      user.id
                                    )
                                  }
                                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold hover:bg-green-500"
                                >
                                  Promote to Admin
                                </button>

                              )}


                              {user.role ===
                                "admin" && (

                                <button
                                  onClick={() =>
                                    demoteUser(
                                      user.id
                                    )
                                  }
                                  className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold hover:bg-yellow-500"
                                >
                                  Demote
                                </button>

                              )}

                            </>

                          )}


                          {/* DELETE */}

                          {user.id !==
                            currentUser?.id && (

                            <button
                              onClick={() =>
                                deleteUser(
                                  user.id
                                )
                              }
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
                            >
                              Delete
                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}