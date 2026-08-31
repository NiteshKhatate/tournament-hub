import { registerPlayer } from "./player.mutations";
import { supabaseAdmin } from "@/lib/supabase-admin";

jest.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

interface MockChain {
  insert: jest.Mock;
  select: jest.Mock;
  single: jest.Mock;
}

function mockChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
    insert: jest.fn(() => chain),
    select: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(finalResult)),
  };
  return chain;
}

describe("registerPlayer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a player record with inactive status", async () => {
    const playerChain = mockChain({
      data: { id: 1, name: "Rohan Sharma", status: "inactive" },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(playerChain);

    const result = await registerPlayer({
      name: "Rohan Sharma",
      email: "rohan@example.com",
      contact: 9999999999,
      sport_id: 1,
      id_type: "aadhar",
      id_proof: "123456789012",
      birthdate: "2000-01-01",
    });

    expect(playerChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Rohan Sharma", status: "inactive" }),
    );
    expect(result.error).toBeNull();
    expect(result.data?.status).toBe("inactive");
  });

  it("accepts optional height and weight", async () => {
    const playerChain = mockChain({
      data: { id: 1, height: 180, weight: 75, status: "inactive" },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(playerChain);

    const result = await registerPlayer({
      name: "Rohan Sharma",
      email: "rohan@example.com",
      contact: 9999999999,
      sport_id: 1,
      id_type: "aadhar",
      id_proof: "123456789012",
      birthdate: "2000-01-01",
      height: 180,
      weight: 75,
    });

    expect(playerChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ height: 180, weight: 75 }),
    );
    expect(result.error).toBeNull();
  });

  it("returns an error when email is already registered", async () => {
    const playerChain = mockChain({
      data: null,
      error: {
        message:
          'duplicate key value violates unique constraint "players_email_key"',
      },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(playerChain);

    const result = await registerPlayer({
      name: "Rohan Sharma",
      email: "rohan@example.com",
      contact: 9999999999,
      sport_id: 1,
      id_type: "aadhar",
      id_proof: "123456789012",
      birthdate: "2000-01-01",
    });

    expect(result.error).toBe(
      'duplicate key value violates unique constraint "players_email_key"',
    );
    expect(result.data).toBeNull();
  });

  it("returns an error when id_proof is already registered", async () => {
    const playerChain = mockChain({
      data: null,
      error: {
        message:
          'duplicate key value violates unique constraint "players_id_proof_key"',
      },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(playerChain);

    const result = await registerPlayer({
      name: "Rohan Sharma",
      email: "new@example.com",
      contact: 8888888888,
      sport_id: 1,
      id_type: "pan",
      id_proof: "ABCDE1234F",
      birthdate: "2000-01-01",
    });

    expect(result.error).toContain("players_id_proof_key");
  });

  it("correctly passes the id_type as provided", async () => {
    const playerChain = mockChain({
      data: { id: 1, id_type: "school_id" },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(playerChain);

    await registerPlayer({
      name: "Young Player",
      email: "young@example.com",
      contact: 7777777777,
      sport_id: 1,
      id_type: "school_id",
      id_proof: "SCH-2024-001",
      birthdate: "2010-05-15",
    });

    expect(playerChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ id_type: "school_id" }),
    );
  });
});
