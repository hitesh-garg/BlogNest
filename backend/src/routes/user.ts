import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { genSaltSync, hashSync, compareSync } from 'bcrypt-edge'
import { signupInput, signinInput } from "@hiteshgarg/medium-common";
export const userRouter = new Hono<{
    Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();


userRouter.post('/signup',async (c) => {
  const prisma = new PrismaClient({
  datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

  const body = await c.req.json();
  const parsed = signupInput.safeParse(body);
  if(! parsed.success){
    c.status(411);
    return c.json({
      message: "Inputs not correct",
      errors: parsed.error.issues,
    })
  }
  const salt = genSaltSync(10);
  const hash = hashSync(body.password , salt)
  try{
      const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hash,
      name: body.name || "Anonymous"
    },
  })

  const jwt = await sign({id: user.id} , c.env.JWT_SECRET)
  return c.json({
    jwt,
    name: user.name
  })
  } catch(e){
    c.status(403);
    return c.json({
      error: "error while signing up"
    });
  }
 
  
})

userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
  datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

  const body = await c.req.json();
  if (!body.email || !body.password) {
  c.status(400);
  return c.json({ error: 'email and password required' });
  }  
   const parsed = signinInput.safeParse(body);
  if(! parsed.success){
    c.status(411);
    return c.json({
      message: "Inputs not correct",
      errors: parsed.error.issues,
    })
  }

  const user = await prisma.user.findUnique({
    where: {
        email: body.email
    }
  });
  if(!user){
    c.status(403);
    return c.json({error: "user not found"});
  }
  const match = compareSync(body.password , user.password)
  if(!match){
    c.status(403)
    return c.json({error: 'invalid password'})
  }
  const jwt = await sign({id: user.id} , c.env.JWT_SECRET);
  return c.json({
    jwt,
    name: user.name

  });
  
})