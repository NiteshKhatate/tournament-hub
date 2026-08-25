import { registerTeam } from "./team.mutations";
import { supabaseAdmin } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";

jest.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hashSync: jest.fn(() => "hashed_password"),
}));

interface MockChain {
  select: jest.Mock;
  insert: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  then: (resolve: (value: { data: unknown; error?: unknown }) => void) => void;
}

function mockChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(finalResult)),
    then: (resolve) => resolve(finalResult),
  };
  return chain;
}

describe("registerTeam", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a login record with inactive status and role team_manager", async () => {
    const loginChain = mockChain({
      data: { id: 200, username: "city_warriors" },
      error: null,
    });
    const teamChain = mockChain({
      data: { id: 1, name: "City Warriors", status: "inactive" },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain)
      .mockReturnValueOnce(teamChain);

    const result = await registerTeam({
      name: "City Warriors",
      sport_id: 1,
      username: "city_warriors",
      password: "password123",
      email: "team@example.com",
      contact: 9999999999,
    });

    expect(bcrypt.hashSync).toHaveBeenCalledWith("password123", 10);
    expect(loginChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "city_warriors",
        role: "team_manager",
        status: "inactive",
      }),
    );
    expect(result.error).toBeNull();
    expect(result.data?.status).toBe("inactive");
  });

  it("creates the team record with inactive status and correct sport_id", async () => {
    const loginChain = mockChain({ data: { id: 200 }, error: null });
    const teamChain = mockChain({
      data: { id: 1, status: "inactive" },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain)
      .mockReturnValueOnce(teamChain);

    await registerTeam({
      name: "City Warriors",
      sport_id: 3,
      username: "city_warriors",
      password: "password123",
      email: "team@example.com",
      contact: 9999999999,
    });

    expect(teamChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "inactive",
        login_id: 200,
        sport_id: 3,
      }),
    );
  });

  it("returns an error when login creation fails", async () => {
    const loginChain = mockChain({
      data: null,
      error: { message: "duplicate key value violates unique constraint" },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(loginChain);

    const result = await registerTeam({
      name: "City Warriors",
      sport_id: 1,
      username: "city_warriors",
      password: "password123",
      email: "team@example.com",
      contact: 9999999999,
    });

    expect(result.error).toBe("duplicate key value violates unique constraint");
    expect(result.data).toBeNull();
  });

  it("rolls back login record if team creation fails", async () => {
    const loginChain = mockChain({ data: { id: 200 }, error: null });
    const teamChain = mockChain({
      data: null,
      error: { message: "duplicate team name" },
    });
    const rollbackChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(rollbackChain);

    const result = await registerTeam({
      name: "City Warriors",
      sport_id: 1,
      username: "city_warriors",
      password: "password123",
      email: "team@example.com",
      contact: 9999999999,
    });

    expect(rollbackChain.delete).toHaveBeenCalled();
    expect(rollbackChain.eq).toHaveBeenCalledWith("id", 200);
    expect(result.error).toBe("duplicate team name");
  });
});
