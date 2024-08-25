import type { Env, MiddlewareHandler, Context } from "hono";
import type { AuthConfig, Session, SignInPageErrorParam } from "@auth/core/types"
import { Auth } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";

export const AUTH_BASE_PATH = "/api/auth"
export const AUTH_ROUTE_PATH = `${AUTH_BASE_PATH}/*`
export const getAuthConfig = <E extends Env>(c: Context<E>): Omit<AuthConfig, "raw"> => {
  return {
    basePath: AUTH_BASE_PATH,
    providers: [
      // example credential
      Credentials({
        credentials: {
          username: {
            label: "Username",
            type: "text",
            placeholder: "admin",
          },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const userEnv: string = c.env.AUTH_USER || "admin:password"
          if (!credentials) return null
          const { username, password } = credentials
          const [user, pass] = userEnv.split(":")
          if (username !== user || password !== pass) {
            return null
          }
          return {
            id: "1",
            name: "Admin",
            email: "a@a.com",
            image: "https://i.pravatar.cc/300",
          }
        }
      })
    ],
    secret: c.env.AUTH_SECRET,
    trustHost: true,
    logger: {
      error(_error) {
        // console.error(error.name)
      },
      debug(_message, _metadata) {
        // log debug
      },
      warn(_code) {
        // log warning
      },
    }
  }
}

export const getSession = async (c: Context): Promise<Session | null> => {
  try {
    const url = new URL(`${AUTH_BASE_PATH}/session`, c.req.raw.url)
    const request = new Request(url, {
      headers: c.req.raw.headers
    })
    const response = await Auth(request, getAuthConfig(c))
    if (!response.ok) return null
    const data = await response.json()
    if (!data || !Object.keys(data).length) return null
    if (!data.user) return null
    return data
  } catch (e) {
    return null
  }
}

export const setupAuthPage = <E extends Env>(): MiddlewareHandler<E, typeof AUTH_ROUTE_PATH> => async (c, next) => {
  if (c.req.path.startsWith(AUTH_BASE_PATH)) return Auth(c.req.raw, getAuthConfig(c))
  return next()
}

export const onlySignedUser = <E extends Env>(): MiddlewareHandler<E, typeof AUTH_ROUTE_PATH> => async (c, next) => {
  const session = await getSession(c)
  if (!session?.user) return c.redirect(`${AUTH_BASE_PATH}/signin?error=${"SessionRequired" as SignInPageErrorParam}&callbackUrl=${c.req.url}`)
  return next()
}