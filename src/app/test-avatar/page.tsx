import React from "react";

const TestAvatarPage = () => {
  const testUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const response = await fetch(
          "https://presentology-back-production.up.railway.app/users/avatar",
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJ1c2xhbm1ha2htYXRvdkBnbWFpbC5jb20iLCJzdWIiOiJjbWV0dWV6czMwMDAwcDkxMTZieXUwbnhxIiwiaWF0IjoxNzU2NjUzNTQ3LCJleHAiOjE3NTcyNTgzNDd9.I2xSWLsajTrUaiGlHDHdafTRvFqR90gnwS_YRLuYgms",
            },
          }
        );

        const result = await response.json();
        console.log("Upload result:", result);
        alert("Upload success: " + JSON.stringify(result));
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload error: " + error);
      }
    };
    input.click();
  };

  const testGetAvatar = async () => {
    try {
      const response = await fetch(
        "https://presentology-back-production.up.railway.app/uploads/avatars/avatar-1756655832300-521409729.png"
      );
      console.log("Get avatar response:", response.status, response.statusText);

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const img = document.createElement("img");
        img.src = url;
        img.style.maxWidth = "200px";
        document.body.appendChild(img);
      } else {
        alert("Avatar not found: " + response.status);
      }
    } catch (error) {
      console.error("Get avatar error:", error);
      alert("Get avatar error: " + error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Avatar Functionality</h1>
      <button onClick={testUpload} style={{ margin: "10px", padding: "10px" }}>
        Test Upload Avatar
      </button>
      <button
        onClick={testGetAvatar}
        style={{ margin: "10px", padding: "10px" }}
      >
        Test Get Avatar
      </button>
    </div>
  );
};

export default TestAvatarPage;
