import WebSocket from "ws";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import dotenv from "dotenv";
import {
  createOrganiser,
  getAllOrganisers,
  getOrganiserById,
  updateOrganiser,
  deleteOrganiser,
  getOrganiserByEmail,
  getOrganiserByUsername,
} from "./organisers";

// Set WebSocket for Node.js 20 compatibility
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket as any;
}

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.PROJECT_URL || "",
  process.env.SECRET_KEY || ""
);

app.get("/", (_req, res) => {
  res.json({
    message: "API running",
  });
});

app.get("/test-connection", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("count", { count: "exact", head: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase connection failed",
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: "Connected to Supabase successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error testing connection",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

app.get("/tables", async (_req, res) => {
  const client = new Client({
    connectionString: process.env.DIRECT_CONNECTION_STRING,
  });

  try {
    await client.connect();

    const result = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name;`
    );

    const tableNames = result.rows.map((row: any) => row.table_name);

    res.json({
      success: true,
      message: "Tables fetched successfully",
      tables: tableNames,
      count: tableNames.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching tables",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  } finally {
    await client.end();
  }
});

// ===== ORGANISER CRUD ROUTES =====

// Create organiser
app.post("/organisers", async (req, res) => {
  try {
    const { name, email, username, password, contact, sport } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, username, password",
      });
    }

    const organiser = await createOrganiser({
      name,
      email,
      username,
      password,
      contact,
      sport,
    });

    res.status(201).json({
      success: true,
      message: "Organiser created successfully",
      data: organiser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating organiser",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get all organisers
app.get("/organisers", async (_req, res) => {
  try {
    const organisers = await getAllOrganisers();

    res.json({
      success: true,
      message: "Organisers fetched successfully",
      data: organisers,
      count: organisers.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching organisers",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get organiser by ID
app.get("/organisers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Organiser ID is required",
      });
    }

    const organiser = await getOrganiserById(id);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found",
      });
    }

    res.json({
      success: true,
      message: "Organiser fetched successfully",
      data: organiser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching organiser",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Update organiser
app.put("/organisers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Organiser ID is required",
      });
    }

    const organiser = await updateOrganiser(id, updateData);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found",
      });
    }

    res.json({
      success: true,
      message: "Organiser updated successfully",
      data: organiser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating organiser",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Delete organiser
app.delete("/organisers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Organiser ID is required",
      });
    }

    const success = await deleteOrganiser(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found",
      });
    }

    res.json({
      success: true,
      message: "Organiser deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting organiser",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get organiser by email
app.get("/organisers/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const organiser = await getOrganiserByEmail(email);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found",
      });
    }

    res.json({
      success: true,
      message: "Organiser fetched successfully",
      data: organiser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching organiser",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get organiser by username
app.get("/organisers/username/:username", async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const organiser = await getOrganiserByUsername(username);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found",
      });
    }

    res.json({
      success: true,
      message: "Organiser fetched successfully",
      data: organiser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching organiser",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get table schema
app.get("/schema/:tableName", async (req, res) => {
  const client = new Client({
    connectionString: process.env.DIRECT_CONNECTION_STRING,
  });

  try {
    await client.connect();

    const { tableName } = req.params;

    const result = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = $1 AND table_schema = 'public'
       ORDER BY ordinal_position;`,
      [tableName]
    );

    res.json({
      success: true,
      tableName,
      columns: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching table schema",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  } finally {
    await client.end();
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});