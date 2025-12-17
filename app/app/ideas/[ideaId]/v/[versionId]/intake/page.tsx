import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import { saveIntakeData } from '@/app/actions/intake';

export default async function IntakePage({
  params
}: {
  params: Promise<{ ideaId: string; versionId: string }>
}) {
  const session = await auth();
  const { ideaId, versionId } = await params;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const version = await prisma.ideaVersion.findUnique({
    where: { id: versionId },
    include: {
      idea: true,
      intakeData: true,
    },
  });

  if (!version) {
    return <div>Version not found</div>;
  }

  const saveIntake = saveIntakeData.bind(null, versionId);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <Link
              href={`/app/ideas/${ideaId}/v/${versionId}/start`}
              className="text-sm text-muted-foreground hover:underline"
            >
              &larr; Back to Wizard
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold">Idea Intake</h1>
          <p className="text-muted-foreground mt-2">
            {version.idea.name} - Version {version.versionNumber}
          </p>
        </div>

        <form action={saveIntake}>
          <div className="space-y-6">
            {/* Problem Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
                <CardDescription>
                  Describe the problem you&apos;re solving clearly and specifically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="problemStatement"
                  placeholder="What problem are you solving? Who experiences this problem? How do they currently deal with it?"
                  rows={5}
                  defaultValue={version.intakeData?.problemStatement || ''}
                  required
                  className="resize-y"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Minimum 10 characters required
                </p>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card>
              <CardHeader>
                <CardTitle>Your Solution</CardTitle>
                <CardDescription>
                  Describe your proposed solution and unique value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="targetCustomer">Target Customer</Label>
                  <Input
                    id="targetCustomer"
                    name="targetCustomer"
                    placeholder="e.g., B2B SaaS companies with 10-50 employees"
                    defaultValue={version.intakeData?.targetCustomer || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="currentSolution">Current Solution</Label>
                  <Textarea
                    id="currentSolution"
                    name="currentSolution"
                    placeholder="How do people currently solve this problem?"
                    rows={3}
                    defaultValue={version.intakeData?.currentSolution || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="proposedSolution">Proposed Solution</Label>
                  <Textarea
                    id="proposedSolution"
                    name="proposedSolution"
                    placeholder="What is your solution? How does it work?"
                    rows={3}
                    defaultValue={version.intakeData?.proposedSolution || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="uniqueValue">Unique Value</Label>
                  <Textarea
                    id="uniqueValue"
                    name="uniqueValue"
                    placeholder="What makes your solution uniquely valuable?"
                    rows={3}
                    defaultValue={version.intakeData?.uniqueValue || ''}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assumptions & Risks */}
            <Card>
              <CardHeader>
                <CardTitle>Assumptions & Risk Factors</CardTitle>
                <CardDescription>
                  List your key assumptions and potential risks (one per line)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="assumptions">Key Assumptions</Label>
                  <Textarea
                    id="assumptions"
                    name="assumptions"
                    placeholder="One assumption per line, e.g.:&#10;- Customers will pay for this solution&#10;- Market is ready for this innovation&#10;- We can acquire customers cost-effectively"
                    rows={5}
                    defaultValue={version.intakeData?.assumptions?.join('\n') || ''}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter each assumption on a new line
                  </p>
                </div>

                <div>
                  <Label htmlFor="riskFactors">Risk Factors</Label>
                  <Textarea
                    id="riskFactors"
                    name="riskFactors"
                    placeholder="One risk per line, e.g.:&#10;- Regulatory compliance challenges&#10;- Strong incumbent competition&#10;- Technology limitations"
                    rows={5}
                    defaultValue={version.intakeData?.riskFactors?.join('\n') || ''}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter each risk factor on a new line
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Founder-Market Fit */}
            <Card>
              <CardHeader>
                <CardTitle>Founder-Market Fit</CardTitle>
                <CardDescription>
                  Your experience and skills relevant to this idea
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="founderExperience">Founder Experience</Label>
                  <Textarea
                    id="founderExperience"
                    name="founderExperience"
                    placeholder="Describe your relevant professional experience"
                    rows={3}
                    defaultValue={version.intakeData?.founderExperience || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="domainExpertise">Domain Expertise</Label>
                  <Textarea
                    id="domainExpertise"
                    name="domainExpertise"
                    placeholder="What domain knowledge do you have in this space?"
                    rows={3}
                    defaultValue={version.intakeData?.domainExpertise || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="relevantSkills">Relevant Skills</Label>
                  <Textarea
                    id="relevantSkills"
                    name="relevantSkills"
                    placeholder="One skill per line, e.g.:&#10;- Software Engineering&#10;- Sales & Marketing&#10;- Product Management"
                    rows={4}
                    defaultValue={version.intakeData?.relevantSkills?.join('\n') || ''}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter each skill on a new line
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <Link href={`/app/ideas/${ideaId}/v/${versionId}/start`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="lg">
                Save & Continue
              </Button>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Idea Intake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Problem Statement:</strong> Be specific about who has the problem and how acute it is.
            </p>
            <p>
              <strong>Unique Value:</strong> What makes your solution 10x better, not just incrementally better?
            </p>
            <p>
              <strong>Assumptions:</strong> List the critical beliefs that must be true for your idea to succeed.
            </p>
            <p>
              <strong>Founder-Market Fit:</strong> Investors look for founders with deep domain expertise or unfair advantages.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
