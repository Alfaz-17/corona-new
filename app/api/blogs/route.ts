import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Blog, slugifyText } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const blogs = await Blog.find({}).sort({ date: -1 });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Blogs GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    if (body.slug) {
      body.slug = slugifyText(body.slug);
    } else if (body.title) {
      body.slug = slugifyText(body.title);
    }
    const blog = await Blog.create(body);

    revalidatePath('/blog');
    revalidatePath('/sitemap.xml');
    revalidatePath(`/blog/${blog.slug || blog._id}`);

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blogs POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
