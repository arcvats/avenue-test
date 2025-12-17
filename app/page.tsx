import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Avebu</h1>
          <div className="space-x-4">
            <Button asChild variant="ghost">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold tracking-tight">
            Validate Your Startup Idea with Data
          </h2>
          <p className="text-xl text-muted-foreground">
            Stop guessing. Use our deterministic validation framework to assess
            your startup idea with evidence-based scoring and AI-powered coaching.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Button asChild size="lg">
              <Link href="/auth/signup">Start Validating</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signin">Demo Login</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Deterministic Scoring</h3>
              <p className="text-muted-foreground">
                Formula-based scoring with full transparency. No black-box AI scores.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">AI Coach</h3>
              <p className="text-muted-foreground">
                Get guidance and critique, not fabricated data. AI helps you think, not decide.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Investor-Ready</h3>
              <p className="text-muted-foreground">
                Generate professional validation memos and artifacts to share with stakeholders.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>START Validation Module v1.0 - Built with Next.js, Prisma, and Claude</p>
        </div>
      </footer>
    </div>
  );
}
