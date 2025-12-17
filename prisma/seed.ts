import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/avebu';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@avebu.com' },
    update: {},
    create: {
      email: 'demo@avebu.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('✅ Created user:', user.email);

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      plan: 'PRO',
    },
  });

  console.log('✅ Created workspace:', workspace.name);

  const membership = await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  console.log('✅ Created workspace membership');

  const idea = await prisma.idea.create({
    data: {
      workspaceId: workspace.id,
      name: 'AI-Powered Code Review Assistant',
      description: 'An AI tool that reviews pull requests and provides intelligent feedback',
    },
  });

  console.log('✅ Created idea:', idea.name);

  const version = await prisma.ideaVersion.create({
    data: {
      ideaId: idea.id,
      versionNumber: 1,
      label: 'Initial validation',
      flowMode: 'NORMAL',
      persona: 'SOLO_FOUNDER',
      status: 'IN_PROGRESS',
    },
  });

  console.log('✅ Created version v1');

  await prisma.stepState.createMany({
    data: [
      { versionId: version.id, step: 'INTAKE', isGatePassed: true },
      { versionId: version.id, step: 'MARKET', isGatePassed: false },
      { versionId: version.id, step: 'ICP', isGatePassed: false },
      { versionId: version.id, step: 'VALIDATION', isGatePassed: false },
      { versionId: version.id, step: 'POSITIONING', isGatePassed: false },
      { versionId: version.id, step: 'SUMMARY', isGatePassed: false },
    ],
  });

  console.log('✅ Created step states');

  const intakeData = await prisma.intakeData.create({
    data: {
      versionId: version.id,
      problemStatement:
        'Engineering teams spend 5-10 hours per week reviewing code manually. Reviews are inconsistent, and junior developers often miss critical issues. This slows down deployment cycles and increases bug rates.',
      targetCustomer:
        'Engineering teams at fast-growing startups and mid-sized tech companies (10-100 developers)',
      currentSolution:
        'Manual code reviews using GitHub PR comments, sometimes supplemented with linters and static analysis tools',
      proposedSolution:
        'An AI-powered code review assistant that analyzes PRs, identifies potential issues, suggests improvements, and learns from team preferences over time',
      uniqueValue:
        'Unlike generic linters, our AI understands context, learns team-specific patterns, and provides explanations for suggestions',
      assumptions: [
        'Engineering teams value faster, more consistent code reviews',
        'Teams are willing to pay for AI-powered developer tools',
        'AI can provide valuable code review insights beyond static analysis',
        'Teams have budget for developer productivity tools',
      ],
      riskFactors: [
        'Developers may not trust AI-generated feedback',
        'Integration complexity with existing workflows',
        'Competition from established players like GitHub Copilot',
      ],
      founderExperience:
        'Worked as a senior engineer at Google for 5 years, led code review process for a team of 50 developers',
      domainExpertise:
        'Deep understanding of code review best practices, software quality, and developer workflows',
      relevantSkills: ['Machine Learning', 'Developer Tools', 'Software Engineering', 'Product Management'],
    },
  });

  console.log('✅ Created intake data');

  const marketData = await prisma.marketData.create({
    data: {
      versionId: version.id,
      totalAddressableMarket: '$5B - Developer Tools market globally',
      serviceableMarket: '$500M - AI-powered code review and analysis tools',
      targetMarket: '$50M - Startups and mid-sized companies with 10-100 developers',
      marketTrends:
        'Strong growth in AI developer tools, increased focus on developer productivity, remote work driving need for async code review',
      regulatoryFactors: 'Data privacy concerns for code analysis, SOC 2 compliance required for enterprise',
    },
  });

  await prisma.competitor.createMany({
    data: [
      {
        marketDataId: marketData.id,
        name: 'GitHub Copilot',
        description: 'AI pair programmer by GitHub',
        strengths: ['Strong brand', 'GitHub integration', 'Large user base'],
        weaknesses: ['Not focused specifically on code review', 'Generic suggestions'],
        marketShare: '~40% of AI developer tools market',
        pricing: '$10-19/user/month',
        url: 'https://github.com/features/copilot',
      },
      {
        marketDataId: marketData.id,
        name: 'CodeRabbit',
        description: 'AI code review assistant',
        strengths: ['Focused on code review', 'Good integration'],
        weaknesses: ['Limited customization', 'Newer player'],
        pricing: '$12/user/month',
        url: 'https://coderabbit.ai',
      },
      {
        marketDataId: marketData.id,
        name: 'Codacy',
        description: 'Automated code review and quality platform',
        strengths: ['Established player', 'Comprehensive features'],
        weaknesses: ['Less AI-focused', 'Complex setup'],
        pricing: '$15/user/month',
        url: 'https://www.codacy.com',
      },
    ],
  });

  console.log('✅ Created competitors');

  const icpData = await prisma.iCPData.create({
    data: {
      versionId: version.id,
      demographics: 'Engineering managers and CTOs at tech companies with 20-100 employees, primarily B2B SaaS',
      psychographics:
        'Value efficiency, quality, and developer happiness. Early adopters of dev tools. Data-driven decision makers.',
      painPoints: [
        'Inconsistent code review quality across team',
        'Junior developers not learning from reviews',
        'Code review bottlenecks slowing deployment',
        'Difficulty maintaining code quality at scale',
        'Time spent on manual review of boilerplate issues',
      ],
      goals: [
        'Ship features faster without sacrificing quality',
        'Level up junior developers',
        'Reduce bugs in production',
        'Improve code consistency',
      ],
      currentBehaviors: [
        'Use GitHub for code review',
        'Run automated tests and linters',
        'Hold weekly engineering meetings',
        'Track velocity and quality metrics',
      ],
      buyingProcess:
        'Engineering manager trials tool, gets team feedback, presents ROI to CTO/CEO, requires security review',
      decisionCriteria: [
        'ROI and time savings',
        'Team adoption and satisfaction',
        'Integration with existing tools',
        'Data security and privacy',
        'Pricing and contract terms',
      ],
      budgetRange: '$1,000-5,000/month for team of 20-50 developers',
      preferredChannels: ['Developer communities', 'Tech blogs', 'Conferences', 'LinkedIn', 'Product Hunt'],
    },
  });

  console.log('✅ Created ICP data');

  await prisma.validationTest.createMany({
    data: [
      {
        versionId: version.id,
        type: 'LANDING_PAGE',
        hypothesis: 'Engineering managers will provide their email for early access to an AI code review tool',
        channel: 'Product Hunt, HackerNews',
        sampleSize: 250,
        successMetric: '15% conversion rate on landing page',
        actualOutcome: '18% conversion rate, 45 signups in 3 days',
        notes: 'Strong interest from YC companies and startups',
        externalLinks: ['https://example.com/landing-page-analytics'],
        isHardSignal: false,
      },
      {
        versionId: version.id,
        type: 'INTERVIEW',
        hypothesis: 'Engineering managers face significant pain with code review process',
        channel: 'LinkedIn outreach',
        sampleSize: 12,
        successMetric: '80% confirm pain point, 50% express willingness to pay',
        actualOutcome: '10/12 confirmed pain point, 8/12 willing to pay $15-25/user/month',
        notes: 'Consistent feedback about review bottlenecks and quality issues',
        externalLinks: [],
        isHardSignal: false,
      },
      {
        versionId: version.id,
        type: 'PROTOTYPE_TEST',
        hypothesis: 'Teams will find AI code review suggestions valuable and adopt the tool',
        channel: 'Beta program',
        sampleSize: 3,
        successMetric: 'Daily active usage, positive feedback',
        actualOutcome: '2/3 teams using daily, 1 team paused. Average 12 PRs reviewed/day',
        notes: 'Teams appreciate time savings but want more customization',
        externalLinks: [],
        isHardSignal: true,
      },
    ],
  });

  console.log('✅ Created validation tests');

  await prisma.positioningData.create({
    data: {
      versionId: version.id,
      tagline: 'Your AI senior engineer for every code review',
      valueProposition:
        'Cut code review time in half while improving quality. Our AI learns your team\'s patterns and provides context-aware feedback that junior and senior developers trust.',
      differentiators: [
        'Team-specific learning and customization',
        'Explains every suggestion with clear reasoning',
        'Seamless GitHub integration',
        'Focus on teaching, not just finding bugs',
      ],
      targetSegment: 'Fast-growing tech startups with 20-100 developers',
      messagingFramework:
        'For engineering teams that want to move fast without breaking things, our AI code review assistant combines the consistency of automation with the insight of senior engineering review.',
    },
  });

  console.log('✅ Created positioning data');

  await prisma.analyticsEvent.createMany({
    data: [
      {
        workspaceId: workspace.id,
        eventName: 'step_completed',
        eventData: { step: 'INTAKE', versionId: version.id },
        userId: user.id,
      },
      {
        workspaceId: workspace.id,
        eventName: 'validation_test_created',
        eventData: { type: 'LANDING_PAGE', versionId: version.id },
        userId: user.id,
      },
    ],
  });

  console.log('✅ Created analytics events');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📧 Demo credentials:');
  console.log('   Email: demo@avebu.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
