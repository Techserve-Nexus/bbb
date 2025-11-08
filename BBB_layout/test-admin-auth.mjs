// Test Admin Authentication
const testAuth = async () => {
  const ADMIN_EMAIL = "rkj9023@gmail.com";
  const ADMIN_PASSWORD = "Rajesh@1234";

  console.log("Testing Admin Authentication...");
  console.log("Email:", ADMIN_EMAIL);
  console.log("Password:", ADMIN_PASSWORD);

  try {
    const response = await fetch("http://localhost:3001/api/admin/users", {
      method: "GET",
      headers: {
        "x-admin-email": ADMIN_EMAIL,
        "x-admin-password": ADMIN_PASSWORD,
      },
    });

    console.log("Response Status:", response.status);
    
    const data = await response.json();
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Authentication Successful!");
      console.log("Total Users:", data.stats.total);
    } else {
      console.log("❌ Authentication Failed!");
      console.log("Error:", data.error);
    }
  } catch (error) {
    console.error("❌ Request Failed:", error.message);
  }
};

testAuth();
