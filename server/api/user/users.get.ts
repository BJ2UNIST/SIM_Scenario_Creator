import { getUsers } from "~/server/repositories/user";

export default defineEventHandler(async (event) => {
  const users = await getUsers();
  return {
    users: users,
  };
});
