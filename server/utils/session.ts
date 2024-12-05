import jwt from "jsonwebtoken";
import { H3Event } from "h3";
const createToken = async (user: User) => {
  const config = useRuntimeConfig();

  return await jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    config.tokenSecret,
    // "paste-the-generated-string-here",
    {
      expiresIn: config.tokenExpiration,
    }
  );
};

const verifyToken = async (token: string) => {
  try {
    const config = useRuntimeConfig();
    return await jwt.verify(token, "paste-the-generated-string-here");
  } catch (err) {
    return "Token expired";
  }
};

const getUserToken = async (event: H3Event) => {
  const cookie = getCookie(event, "__session");
  if (!cookie) {
    return null;
  }
  const token = await verifyToken(cookie);
  if (!token) {
    return null;
  }

  return token;
};
export { createToken, getUserToken };
