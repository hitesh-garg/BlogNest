import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@hiteshgarg/medium-common";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string;
    }
}>();

blogRouter.use("/*" ,async (c , next) => {
    const authHeader = c.req.header("authorization") || "";
    const user = await verify(authHeader , c.env.JWT_SECRET)  as { id: string };;
    if(user){
        c.set("userId" , user.id);
        await next();
    }else{
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
    

})

blogRouter.post('/',async (c) => {
    const body = await c.req.json();
    const parsed = createBlogInput.safeParse(body);
    if (!parsed.success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct",
            errors: parsed.error.issues,
        });
    }
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    
    const authorId = c.get("userId");
    const post  = await prisma.post.create({
        data: {
            title: parsed.data.title , 
            content: parsed.data.content,
            authorId: authorId,
            published: true
        }
    })

    return c.json({
        id: post.id
    })

})

blogRouter.put('/',async (c) => {
    const body = await c.req.json();
    const parsed = updateBlogInput.safeParse(body);
    if (!parsed.success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct",
            errors: parsed.error.issues,
        });
    }
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    

    const post  = await prisma.post.update({
        where: {
            id: parsed.data.id
        },
        data: {
            title: parsed.data.title , 
            content: parsed.data.content,
            
        }
    })

    return c.json({
        id: post.id
    })
})

blogRouter.get('/bulk',async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blogs = await prisma.post.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            publishedAt: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    });

    return c.json({
        blogs
    })
})

blogRouter.get('/:id',async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const id = c.req.param("id");

    try{
        const post  = await prisma.post.findFirst({
        where: {
            id
        },
        select: {
            content: true,
            title: true,
            id: true,
            publishedAt: true,
            author: {
                select: {
                    name: true
                }
            }
        }
        })

        return c.json({
            post
        })
    } catch (e){
        c.status(411);
        return c.json({
            message: "Error while fetching blog post"
        })
    }

    
})

