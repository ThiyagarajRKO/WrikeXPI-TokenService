import { Tokens } from "../controllers";
import { decryptWithKey } from "../utils/crypto";

export const ValidateToken = async (req, reply) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return reply.code(401).send({
        message: "Failed authentication! Unable to authenticate user or token.",
      });
    }

    await req.jwtVerify();

    const { uid, encAccessTokenKey, encRefreshTokenKey } = req?.user;

    if (!uid || !encAccessTokenKey || !encRefreshTokenKey)
      return reply.code(403).send({
        message:
          "Failed authorization! User is not authorized to access the service.",
      });

    const {
      encrypted_access_token: encAccessToken,
      encrypted_refresh_token: encRefreshToken,
    } = await Tokens.GetByUserId(uid);

    if (!encAccessToken)
      return reply.code(401).send({
        message:
          "Failed authorization! User is not authorized to access the service.",
      });

    const wrikeAccessToken = await decryptWithKey(
      encAccessToken,
      encAccessTokenKey
    );

    const wrikeRefreshToken = await decryptWithKey(
      encRefreshToken,
      encRefreshTokenKey
    );

    if (!wrikeAccessToken || !wrikeRefreshToken)
      return reply.code(401).send({
        message:
          "Failed authorization! User is not authorized to access the service.",
      });

    req.wrikeToken = wrikeAccessToken;
  } catch (err) {
    console.error(new Date().toISOString() + " : " + err?.message || err);
    reply.code(401).send({
      success: false,
      message: "Failed authentication! Unable to authenticate user or token.",
    });
  }
};
