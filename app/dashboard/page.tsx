// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import shadcn-ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from '@/components/ui/table';

type Post = {
  id: number;
  title: string;
  body: string;
};

export default function DashboardPage() {
  const router = useRouter();

  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 5;

  // Check authentication: redirect to login if no token exists.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Fetch posts from API (JSONPlaceholder)
  useEffect(() => {
    setLoading(true);
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then((res) => res.json())
      .then((data: Post[]) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch posts');
        setLoading(false);
      });
  }, []);

  // Filter posts based on search term (matches title or ID)
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.id.toString().includes(searchTerm)
  );

  // Pagination calculations
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Logout: clear token and redirect to login page.
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-500 text-white p-4">
        <h1 className="text-xl">Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      {/* Layout: Sidebar and Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-200 p-5">
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="/settings" className="hover:underline">
                  Settings
                </a>
              </li>
              <li>
                <a href="/profile" className="hover:underline">
                  Profile
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <h2 className="text-2xl mb-4">Posts</h2>

          {/* Search Input using shadcn Input */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by title or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Loading or error messages */}
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Body</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentPosts.map((post) => (
                        <TableRow key={post.id}>
                            <TableCell className="whitespace-normal break-words">{post.id}</TableCell>
                            <TableCell className="whitespace-normal break-words">{post.title}</TableCell>
                            <TableCell className="whitespace-normal break-words">{post.body}</TableCell>
                        </TableRow>
                    ))} 
                    </TableBody>
                </Table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index}
                variant={
                  currentPage === index + 1 ? 'default' : 'outline'
                }
                onClick={() => setCurrentPage(index + 1)}
                className="mx-1"
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
