import { useState } from "react";
import { UserPlus } from "lucide-react";

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    staffId: "",
    userType: "",
    department: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    name : formData.firstName + " " + formData.lastName,
    email : formData.email,
    password : formData.password,
    role : formData.userType?.toUpperCase() || "STUDENT",
    department : formData.department,
    staffId : formData.staffId,

  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Signup successful:", data);
      alert("Account created successfully!");
    } else {
      const error = await response.text();
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong!");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-50 rounded-full">
            <UserPlus className="text-blue-800 w-8 h-8" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-2">
          Join the Portal
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Create your university complaint portal account
        </p>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                step === 1 ? "bg-blue-900" : "bg-gray-300"
              }`}
            >
              1
            </div>
            <span className={`${step === 1 ? "text-blue-900" : "text-gray-400"}`}>
              Personal Info
            </span>
          </div>
          <div className="mx-4 h-0.5 w-10 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                step === 2 ? "bg-blue-900" : "bg-gray-300"
              }`}
            >
              2
            </div>
            <span className={`${step === 2 ? "text-blue-900" : "text-gray-400"}`}>
              Account Setup
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {step === 1 && (
            <>
              <div className="flex gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="FirstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-1/2 border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-1/2 border rounded-lg px-3 py-2"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="University Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="staffId"
                placeholder="Student/Staff ID"
                value={formData.staffId}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-900 text-white py-2 rounded-lg mt-4"
              >
                Continue to Account Setup
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex gap-4">
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-1/2 border rounded-lg px-3 py-2"
                >
                  <option value="">Select user type</option>
                  <option value="student">Student</option>
                  <option value="warden">Warden</option>
                  <option value="faculty">Faculty</option>
                  <option value="Admin">Admin</option>
                </select>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-1/2 border rounded-lg px-3 py-2"
                >
                  <option value="">Select department</option>
                  <option value="cs">Computer Science</option>
                  <option value="eng">Engineering</option>
                  <option value="bus">Business</option>
                </select>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <div className="flex justify-between gap-4 mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 border border-gray-300 py-2 rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-900 text-white py-2 rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}


export default Signup