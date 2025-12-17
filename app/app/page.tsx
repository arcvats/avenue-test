import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RBACService } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CreateWorkspaceDialog } from '@/components/create-workspace-dialog';
import { CreateIdeaDialog } from '@/components/create-idea-dialog';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const workspaces = await RBACService.getUserWorkspaces(session.user.id);

  const defaultWorkspace = workspaces[0];

  if (!defaultWorkspace) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to Avebu!</h1>
            <ThemeToggle />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>No Workspaces Found</CardTitle>
              <CardDescription>
                Create your first workspace to get started with idea validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateWorkspaceDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ideas = await prisma.idea.findMany({
    where: { workspaceId: defaultWorkspace.id },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
      },
      _count: {
        select: { versions: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ideas Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Workspace: {defaultWorkspace.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CreateIdeaDialog workspaceId={defaultWorkspace.id} />
          </div>
        </div>

        {ideas.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Ideas Yet</CardTitle>
              <CardDescription>
                Create your first idea to start the validation process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateIdeaDialog workspaceId={defaultWorkspace.id} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{idea.name}</CardTitle>
                  {idea.description && (
                    <CardDescription className="line-clamp-2">
                      {idea.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Versions:</span>
                      <span className="font-medium">{idea._count.versions}</span>
                    </div>
                    {idea.versions[0] && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">{idea.versions[0].status}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/app/ideas/${idea.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
