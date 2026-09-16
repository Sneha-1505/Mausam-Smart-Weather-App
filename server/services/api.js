const API_URL = "http://localhost:5000/api";

export async function createUser(userData) {
  const response = await fetch(
    `${API_URL}/users`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to create user"
    );
  }

  return data;
}

export async function getUser(userId) {
  const response = await fetch(
    `${API_URL}/users/${userId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to fetch user"
    );
  }

  return data;
}

export async function updateUser(
  userId,
  userData
) {
  const response = await fetch(
    `${API_URL}/users/${userId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to update user"
    );
  }

  return data;
}