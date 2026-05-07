import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

interface LoginData {
  username: string;
  password: string;
  role?: string;
}

interface OrganiserData {
  name: string;
  email: string;
  contact?: string;
  sport?: string;
  username: string;
  password: string;
}

interface Organiser {
  id: string;
  login_id: string;
  name: string;
  email: string;
  contact?: string;
  sport?: string;
  created?: string;
}

const getDbClient = () => {
  return new Client({
    connectionString: process.env.DIRECT_CONNECTION_STRING,
  });
};

/**
 * Create a new organiser with corresponding login entry
 */
export const createOrganiser = async (
  organiserData: OrganiserData
): Promise<Organiser | null> => {
  const client = getDbClient();

  try {
    await client.connect();

    // Start transaction
    await client.query("BEGIN");

    try {
      // 1. Create login entry
      const loginResult = await client.query(
        `INSERT INTO login (username, password, role)
         VALUES ($1, $2, $3)
         RETURNING id;`,
        [organiserData.username, organiserData.password, "organiser"]
      );

      const loginId = loginResult.rows[0]?.id;

      if (!loginId) {
        throw new Error("Failed to create login entry");
      }

      // 2. Create organiser entry
      const organiserResult = await client.query(
        `INSERT INTO organisers (login_id, name, email, contact, sport)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;`,
        [
          loginId,
          organiserData.name,
          organiserData.email,
          organiserData.contact || null,
          organiserData.sport || "general",
        ]
      );

      await client.query("COMMIT");

      return organiserResult.rows[0] || null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating organiser:", error);
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Get all organisers
 */
export const getAllOrganisers = async (): Promise<Organiser[]> => {
  const client = getDbClient();

  try {
    await client.connect();

    const result = await client.query(
      `SELECT o.*, l.username FROM organisers o
       LEFT JOIN login l ON o.login_id = l.id
       ORDER BY o.created DESC;`
    );

    return result.rows;
  } catch (error) {
    console.error("Error fetching organisers:", error);
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Get organiser by ID
 */
export const getOrganiserById = async (id: string): Promise<Organiser | null> => {
  const client = getDbClient();

  try {
    await client.connect();

    const result = await client.query(
      `SELECT o.*, l.username FROM organisers o
       LEFT JOIN login l ON o.login_id = l.id
       WHERE o.id = $1;`,
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching organiser:", error);
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Update organiser by ID
 */
export const updateOrganiser = async (
  id: string,
  updateData: Partial<OrganiserData>
): Promise<Organiser | null> => {
  const client = getDbClient();

  try {
    await client.connect();

    // Build dynamic update query
    const allowedFields = ["name", "email", "contact", "sport"];
    const fields = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key) && updateData[key as keyof OrganiserData] !== undefined)
      .map((key, index) => `${key} = $${index + 2}`);

    if (fields.length === 0) {
      return await getOrganiserById(id);
    }

    const values = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key) && updateData[key as keyof OrganiserData] !== undefined)
      .map((key) => updateData[key as keyof OrganiserData]);

    const query = `
      UPDATE organisers 
      SET ${fields.join(", ")}
      WHERE id = $1
      RETURNING *;
    `;

    const result = await client.query(query, [id, ...values]);

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error updating organiser:", error);
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Delete organiser by ID (also deletes corresponding login entry)
 */
export const deleteOrganiser = async (id: string): Promise<boolean> => {
  const client = getDbClient();

  try {
    await client.connect();

    // Start transaction
    await client.query("BEGIN");

    try {
      // Get login_id before deleting
      const organiserResult = await client.query(
        `SELECT login_id FROM organisers WHERE id = $1;`,
        [id]
      );

      const loginId = organiserResult.rows[0]?.login_id;

      // Delete organiser
      await client.query(`DELETE FROM organisers WHERE id = $1;`, [id]);

      // Delete corresponding login entry
      if (loginId) {
        await client.query(`DELETE FROM login WHERE id = $1;`, [loginId]);
      }

      await client.query("COMMIT");

      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting organiser:", error);
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Get organiser by email
 */
export const getOrganiserByEmail = async (email: string): Promise<Organiser | null> => {
  const client = getDbClient();

  try {
    await client.connect();

    const result = await client.query(
      `SELECT o.*, l.username FROM organisers o
       LEFT JOIN login l ON o.login_id = l.id
       WHERE o.email = $1;`,
      [email]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching organiser by email:", error);
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Get organiser by username
 */
export const getOrganiserByUsername = async (username: string): Promise<Organiser | null> => {
  const client = getDbClient();

  try {
    await client.connect();

    const result = await client.query(
      `SELECT o.*, l.username FROM organisers o
       LEFT JOIN login l ON o.login_id = l.id
       WHERE l.username = $1;`,
      [username]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching organiser by username:", error);
    throw error;
  } finally {
    await client.end();
  }
};
