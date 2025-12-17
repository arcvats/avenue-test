import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function IdeaPage({ params }: { params: Promise<{ ideaId: string }> }) {
  const session = await auth();
  const { ideaId } = await params;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      workspace: true,
      versions: {
        orderBy: { versionNumber: 'desc' },
        include: {
          scoreRuns: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!idea) {
    return <div>Idea not found</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/app" className="text-sm text-muted-foreground hover:underline">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-4">{idea.name}</h1>
          {idea.description && (
            <p className="text-muted-foreground mt-2">{idea.description}</p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Versions</h2>
            <div className="space-y-4">
              {idea.versions.map((version) => (
                <Card key={version.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          v{version.versionNumber}
                          {version.label && `: ${version.label}`}
                        </CardTitle>
                        <CardDescription>
                          {version.flowMode} mode · {version.persona}
                        </CardDescription>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-secondary">
                        {version.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {version.scoreRuns[0] && (
                      <div className="mb-4 p-4 bg-muted rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Latest Score:</span>
                          <span className="text-2xl font-bold">
                            {version.scoreRuns[0].totalScore.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Confidence: {version.scoreRuns[0].confidence}
                          </span>
                          <span className="font-medium">
                            {version.scoreRuns[0].recommendation.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        asChild
                        size="sm"
                      >
                        <Link href={`/app/ideas/${ideaId}/v/${version.id}/start`}>
                          Continue Validation
                        </Link>
                      </Button>
                      {version.scoreRuns.length > 0 && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/app/ideas/${ideaId}/v/${version.id}/summary`}>
                            View Summary
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button variant="outline">Create New Version</Button>
        </div>
      </div>
    </div>
  );
}
