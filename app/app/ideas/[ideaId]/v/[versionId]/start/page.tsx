import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { GatingService } from '@/lib/services/gating';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OverrideDialog } from '@/components/override-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default async function StartWizardPage({ params }: { params: Promise<{ ideaId: string; versionId: string }> }) {
  const session = await auth();
  const { ideaId, versionId } = await params;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const version = await prisma.ideaVersion.findUnique({
    where: { id: versionId },
    include: {
      idea: true,
      stepStates: true,
      intakeData: true,
      marketData: {
        include: { competitors: true },
      },
      icpData: true,
      validationTests: true,
      positioningData: true,
    },
  });

  if (!version) {
    return <div>Version not found</div>;
  }

  const steps = [
    { key: 'INTAKE', label: 'Idea Intake', path: 'intake', description: 'Define your problem and solution' },
    { key: 'MARKET', label: 'Market Check', path: 'market', description: 'Analyze competition and market size' },
    { key: 'ICP', label: 'ICP Builder', path: 'icp', description: 'Define your ideal customer' },
    { key: 'VALIDATION', label: 'Validation Tests', path: 'validation', description: 'Collect evidence and demand signals' },
    { key: 'POSITIONING', label: 'Positioning', path: 'positioning', description: 'Craft your value proposition' },
    { key: 'SUMMARY', label: 'Summary', path: 'summary', description: 'View your validation score' },
  ];

  const stepStatus = version.stepStates.reduce((acc, state) => {
    acc[state.step] = state.isGatePassed;
    return acc;
  }, {} as Record<string, boolean>);

  // Check if user can access each step
  const canAccess: Record<string, boolean> = {};
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (i === 0) {
      // First step is always accessible
      canAccess[step.key] = true;
    } else {
      // Other steps require previous step to be passed
      const previousStep = steps[i - 1];
      canAccess[step.key] = stepStatus[previousStep.key] || false;
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <Link href={`/app/ideas/${ideaId}`} className="text-sm text-muted-foreground hover:underline">
              &larr; Back to Idea
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold">{version.idea.name} - Validation Wizard</h1>
          <p className="text-muted-foreground mt-1">
            Version {version.versionNumber} · {version.flowMode} mode
          </p>
        </div>

        <div className="grid gap-4">
          {steps.map((step, index) => {
            const isPassed = stepStatus[step.key] || false;
            const isAccessible = canAccess[step.key] || false;
            const isFirstStep = index === 0;

            return (
              <Card
                key={step.key}
                className={!isAccessible ? 'opacity-60 bg-muted/30' : ''}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Step Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isPassed
                          ? 'bg-green-100 text-green-600'
                          : isAccessible
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isPassed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isAccessible ? (
                          <span className="font-semibold">{index + 1}</span>
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>

                      {/* Step Info */}
                      <div>
                        <h3 className="font-semibold text-lg">{step.label}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {!isAccessible && (
                          <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Complete previous step to unlock
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2">
                      {isPassed && (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Complete
                        </span>
                      )}

                      {isAccessible ? (
                        <Button
                          asChild
                          size="sm"
                          variant={isPassed ? "outline" : "default"}
                        >
                          <Link href={`/app/ideas/${ideaId}/v/${versionId}/${step.path}`}>
                            {isPassed ? 'Review' : 'Start'}
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                        >
                          Locked
                        </Button>
                      )}

                      {/* Override button only on first step */}
                      {isFirstStep && (
                        <OverrideDialog versionId={versionId} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  About the Gated Workflow
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <p>
                    This validation framework uses a <strong>sequential gated approach</strong>.
                    Each step must be completed before the next one unlocks.
                  </p>
                  <p>
                    <strong>Need to skip ahead?</strong> Use the "Override Gates" button on Idea Intake.
                    This will unlock all steps but will be logged in your final validation memo.
                  </p>
                  <p>
                    Your flow mode is <strong className="uppercase">{version.flowMode}</strong>.
                    Different modes have different requirements per step.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
