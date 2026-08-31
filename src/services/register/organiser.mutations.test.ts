import { registerOrganiser } from "./organiser.mutations";
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

describe("registerOrganiser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a login record with inactive status and role organiser", async () => {
    const loginChain = mockChain({
      data: { id: 100, username: "city_club" },
      error: null,
    });
    const organiserChain = mockChain({
      data: { id: 1, name: "City Club", status: "inactive" },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain)
      .mockReturnValueOnce(organiserChain);

    const result = await registerOrganiser({
      name: "City Club",
      username: "city_club",
      password: "password123",
      email: "club@example.com",
      contact: 9999999999,
    });

    expect(bcrypt.hashSync).toHaveBeenCalledWith("password123", 10);
    expect(loginChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "city_club",
        role: "organiser",
        status: "inactive",
      }),
    );
    expect(result.error).toBeNull();
    expect(result.data?.status).toBe("inactive");
  });

  it("creates the organiser record with inactive status", async () => {
    const loginChain = mockChain({ data: { id: 100 }, error: null });
    const organiserChain = mockChain({
      data: { id: 1, status: "inactive" },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain)
      .mockReturnValueOnce(organiserChain);

    await registerOrganiser({
      name: "City Club",
      username: "city_club",
      password: "password123",
      email: "club@example.com",
      contact: 9999999999,
    });

    expect(organiserChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "inactive", login_id: 100 }),
    );
  });

  it("returns an error when login creation fails (duplicate username)", async () => {
    const loginChain = mockChain({
      data: null,
      error: { message: "duplicate key value violates unique constraint" },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(loginChain);

    const result = await registerOrganiser({
      name: "City Club",
      username: "city_club",
      password: "password123",
      email: "club@example.com",
      contact: 9999999999,
    });

    expect(result.error).toBe("duplicate key value violates unique constraint");
    expect(result.data).toBeNull();
  });

  it("rolls back login record if organiser creation fails", async () => {
    const loginChain = mockChain({ data: { id: 100 }, error: null });
    const organiserChain = mockChain({
      data: null,
      error: { message: "duplicate organiser name" },
    });
    const rollbackChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain)
      .mockReturnValueOnce(organiserChain)
      .mockReturnValueOnce(rollbackChain);

    const result = await registerOrganiser({
      name: "City Club",
      username: "city_club",
      password: "password123",
      email: "club@example.com",
      contact: 9999999999,
    });

    expect(rollbackChain.delete).toHaveBeenCalled();
    expect(rollbackChain.eq).toHaveBeenCalledWith("id", 100);
    expect(result.error).toBe("duplicate organiser name");
  });
});
