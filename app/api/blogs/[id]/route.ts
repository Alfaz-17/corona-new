import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Blog, slugifyText } from '@/lib/models';
import { getSession } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    let blog;
    if (isValidObjectId(id)) {
      blog = await Blog.findById(id);
    } else {
      blog = await Blog.findOne({ slug: id });
    }

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();

    if (typeof body.slug === 'string') {
      if (body.slug.trim()) {
        body.slug = slugifyText(body.slug);
      } else if (body.title) {
        body.slug = slugifyText(body.title);
      } else {
        delete body.slug;
      }
    }

    let updatedBlog;
    if (isValidObjectId(id)) {
      updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true });
    } else {
      updatedBlog = await Blog.findOneAndUpdate({ slug: id }, body, { new: true });
    }

    if (!updatedBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    revalidatePath('/blog');
    revalidatePath('/sitemap.xml');
    revalidatePath(`/blog/${updatedBlog.slug || id}`);

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Blog PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    let deletedBlog;
    if (isValidObjectId(id)) {
      deletedBlog = await Blog.findByIdAndDelete(id);
    } else {
      deletedBlog = await Blog.findOneAndDelete({ slug: id });
    }

    if (!deletedBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    revalidatePath('/blog');
    revalidatePath('/sitemap.xml');
    revalidatePath(`/blog/${deletedBlog.slug || id}`);

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
