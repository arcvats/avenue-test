import { prisma } from '@/lib/prisma';
import type {
  IntakeData,
  MarketData,
  ICPData,
  ValidationTest,
  PositioningData,
  FlowMode,
  ConfidenceLevel,
  Recommendation
} from '@prisma/client';

interface ScoringInput {
  intakeData: IntakeData | null;
  marketData: (MarketData & { competitors: any[] }) | null;
  icpData: ICPData | null;
  validationTests: ValidationTest[];
  positioningData: PositioningData | null;
  flowMode: FlowMode;
}

interface DimensionScore {
  score: number;
  explanation: string;
  itemsHit: string[];
  itemsMissed: string[];
  suggestions: string[];
}

interface ScoringResult {
  totalScore: number;
  confidence: ConfidenceLevel;
  recommendation: Recommendation;
  dimensions: {
    problemClarity: DimensionScore;
    icpClarity: DimensionScore;
    marketSaturation: DimensionScore;
    demandSignals: DimensionScore;
    founderMarketFit: DimensionScore;
    evidenceCompleteness: DimensionScore;
  };
  inputsSnapshot: any;
}

const WEIGHTS = {
  problemClarity: 20,
  icpClarity: 20,
  marketSaturation: 15,
  demandSignals: 25,
  founderMarketFit: 10,
  evidenceCompleteness: 10,
};

export class ScoringEngine {

  static async computeScore(versionId: string): Promise<ScoringResult> {
    const version = await prisma.ideaVersion.findUnique({
      where: { id: versionId },
      include: {
        intakeData: true,
        marketData: {
          include: {
            competitors: true,
            segments: true,
          },
        },
        icpData: true,
        validationTests: {
          include: {
            attachments: true,
          },
        },
        positioningData: true,
      },
    });

    if (!version) {
      throw new Error('Version not found');
    }

    const input: ScoringInput = {
      intakeData: version.intakeData,
      marketData: version.marketData,
      icpData: version.icpData,
      validationTests: version.validationTests,
      positioningData: version.positioningData,
      flowMode: version.flowMode,
    };

    const problemClarity = this.scoreProblemClarity(input);
    const icpClarity = this.scoreICPClarity(input);
    const marketSaturation = this.scoreMarketSaturation(input);
    const demandSignals = this.scoreDemandSignals(input);
    const founderMarketFit = this.scoreFounderMarketFit(input);
    const evidenceCompleteness = this.scoreEvidenceCompleteness(input);

    const totalScore =
      (problemClarity.score * WEIGHTS.problemClarity +
       icpClarity.score * WEIGHTS.icpClarity +
       marketSaturation.score * WEIGHTS.marketSaturation +
       demandSignals.score * WEIGHTS.demandSignals +
       founderMarketFit.score * WEIGHTS.founderMarketFit +
       evidenceCompleteness.score * WEIGHTS.evidenceCompleteness) / 100;

    const confidence = this.computeConfidence(input, evidenceCompleteness.score);
    const recommendation = this.computeRecommendation(totalScore, confidence);

    const result: ScoringResult = {
      totalScore,
      confidence,
      recommendation,
      dimensions: {
        problemClarity,
        icpClarity,
        marketSaturation,
        demandSignals,
        founderMarketFit,
        evidenceCompleteness,
      },
      inputsSnapshot: input,
    };

    await prisma.scoreRun.create({
      data: {
        versionId,
        totalScore,
        confidence,
        recommendation,
        problemClarityScore: problemClarity.score,
        icpClarityScore: icpClarity.score,
        marketSaturationScore: marketSaturation.score,
        demandSignalsScore: demandSignals.score,
        founderMarketFitScore: founderMarketFit.score,
        evidenceCompletenessScore: evidenceCompleteness.score,
        explanationJson: JSON.parse(JSON.stringify(result.dimensions)),
        inputsSnapshot: JSON.parse(JSON.stringify(input)),
      },
    });

    return result;
  }

  private static scoreProblemClarity(input: ScoringInput): DimensionScore {
    const items = [
      { key: 'problemStatement', label: 'Clear problem statement', check: () => input.intakeData?.problemStatement && input.intakeData.problemStatement.length >= 50 },
      { key: 'targetCustomer', label: 'Target customer identified', check: () => !!input.intakeData?.targetCustomer },
      { key: 'currentSolution', label: 'Current solution described', check: () => !!input.intakeData?.currentSolution },
      { key: 'proposedSolution', label: 'Proposed solution defined', check: () => !!input.intakeData?.proposedSolution },
      { key: 'uniqueValue', label: 'Unique value articulated', check: () => !!input.intakeData?.uniqueValue },
      { key: 'assumptions', label: 'Key assumptions listed (3+)', check: () => (input.intakeData?.assumptions?.length || 0) >= 3 },
      { key: 'riskFactors', label: 'Risk factors identified (2+)', check: () => (input.intakeData?.riskFactors?.length || 0) >= 2 },
    ];

    const itemsHit: string[] = [];
    const itemsMissed: string[] = [];

    items.forEach(item => {
      if (item.check()) {
        itemsHit.push(item.label);
      } else {
        itemsMissed.push(item.label);
      }
    });

    const score = (itemsHit.length / items.length) * 100;

    const suggestions: string[] = [];
    if (!input.intakeData?.problemStatement || input.intakeData.problemStatement.length < 50) {
      suggestions.push('Expand your problem statement to be more detailed and specific');
    }
    if (!input.intakeData?.uniqueValue) {
      suggestions.push('Articulate what makes your solution uniquely valuable');
    }
    if ((input.intakeData?.assumptions?.length || 0) < 3) {
      suggestions.push('List at least 3 key assumptions underlying your idea');
    }

    return {
      score,
      explanation: `Problem Clarity: ${itemsHit.length}/${items.length} criteria met`,
      itemsHit,
      itemsMissed,
      suggestions,
    };
  }

  private static scoreICPClarity(input: ScoringInput): DimensionScore {
    const items = [
      { key: 'demographics', label: 'Demographics defined', check: () => !!input.icpData?.demographics },
      { key: 'psychographics', label: 'Psychographics defined', check: () => !!input.icpData?.psychographics },
      { key: 'painPoints', label: 'Pain points identified (3+)', check: () => (input.icpData?.painPoints?.length || 0) >= 3 },
      { key: 'goals', label: 'Customer goals listed (2+)', check: () => (input.icpData?.goals?.length || 0) >= 2 },
      { key: 'currentBehaviors', label: 'Current behaviors documented', check: () => (input.icpData?.currentBehaviors?.length || 0) >= 1 },
      { key: 'buyingProcess', label: 'Buying process mapped', check: () => !!input.icpData?.buyingProcess },
      { key: 'decisionCriteria', label: 'Decision criteria identified', check: () => (input.icpData?.decisionCriteria?.length || 0) >= 2 },
      { key: 'budgetRange', label: 'Budget range estimated', check: () => !!input.icpData?.budgetRange },
    ];

    const itemsHit: string[] = [];
    const itemsMissed: string[] = [];

    items.forEach(item => {
      if (item.check()) {
        itemsHit.push(item.label);
      } else {
        itemsMissed.push(item.label);
      }
    });

    const score = (itemsHit.length / items.length) * 100;

    const suggestions: string[] = [];
    if ((input.icpData?.painPoints?.length || 0) < 3) {
      suggestions.push('Identify at least 3 specific pain points your ICP experiences');
    }
    if (!input.icpData?.buyingProcess) {
      suggestions.push('Map out how your ICP currently makes buying decisions');
    }

    return {
      score,
      explanation: `ICP Clarity: ${itemsHit.length}/${items.length} criteria met`,
      itemsHit,
      itemsMissed,
      suggestions,
    };
  }

  private static scoreMarketSaturation(input: ScoringInput): DimensionScore {
    const competitorCount = input.marketData?.competitors?.length || 0;

    let score = 100;
    let explanation = 'Low market saturation (favorable)';
    const itemsHit: string[] = [];
    const itemsMissed: string[] = [];
    const suggestions: string[] = [];

    if (competitorCount === 0) {
      score = 60;
      explanation = 'No competitors identified - may indicate lack of market research';
      itemsMissed.push('Competitor analysis');
      suggestions.push('Research and document at least 3-5 competitors or alternatives');
    } else if (competitorCount <= 3) {
      score = 90;
      explanation = 'Few competitors - healthy market';
      itemsHit.push('Limited competition identified');
    } else if (competitorCount <= 7) {
      score = 70;
      explanation = 'Moderate competition - differentiation critical';
      itemsHit.push('Moderate competition mapped');
      suggestions.push('Ensure your differentiation strategy is strong');
    } else {
      score = 50;
      explanation = 'Highly saturated market - challenging';
      itemsMissed.push('High competition levels');
      suggestions.push('Focus on narrow niche or unique positioning');
    }

    if (!input.marketData?.targetMarket) {
      score -= 10;
      itemsMissed.push('Target market size defined');
      suggestions.push('Quantify your target market size');
    } else {
      itemsHit.push('Target market defined');
    }

    if (!input.marketData?.marketTrends) {
      itemsMissed.push('Market trends analyzed');
    } else {
      itemsHit.push('Market trends documented');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      explanation,
      itemsHit,
      itemsMissed,
      suggestions,
    };
  }

  private static scoreDemandSignals(input: ScoringInput): DimensionScore {
    const tests = input.validationTests || [];
    const hardSignals = tests.filter(t => t.isHardSignal);
    const completedTests = tests.filter(t => t.actualOutcome);

    const items = [
      { key: 'anyTests', label: 'Validation tests conducted', check: () => tests.length > 0 },
      { key: 'multipleTests', label: 'Multiple tests (3+)', check: () => tests.length >= 3 },
      { key: 'diverseTests', label: 'Diverse test types (2+)', check: () => new Set(tests.map(t => t.type)).size >= 2 },
      { key: 'hardSignals', label: 'Hard demand signals present', check: () => hardSignals.length > 0 },
      { key: 'completedTests', label: 'Tests with outcomes (50%+)', check: () => completedTests.length >= Math.ceil(tests.length * 0.5) },
      { key: 'sampleSize', label: 'Adequate sample sizes', check: () => tests.some(t => (t.sampleSize || 0) >= 20) },
    ];

    const itemsHit: string[] = [];
    const itemsMissed: string[] = [];

    items.forEach(item => {
      if (item.check()) {
        itemsHit.push(item.label);
      } else {
        itemsMissed.push(item.label);
      }
    });

    let baseScore = (itemsHit.length / items.length) * 100;

    if (hardSignals.length > 0) {
      baseScore += 10;
    }

    const score = Math.min(100, baseScore);

    const suggestions: string[] = [];
    if (tests.length === 0) {
      suggestions.push('Conduct at least one validation test (survey, landing page, or interview)');
    }
    if (hardSignals.length === 0) {
      suggestions.push('Seek hard signals like pre-orders, LOIs, or paid pilots');
    }
    if (completedTests.length < tests.length) {
      suggestions.push('Complete all started validation tests with documented outcomes');
    }

    return {
      score,
      explanation: `Demand Signals: ${itemsHit.length}/${items.length} criteria met`,
      itemsHit,
      itemsMissed,
      suggestions,
    };
  }

  private static scoreFounderMarketFit(input: ScoringInput): DimensionScore {
    const items = [
      { key: 'experience', label: 'Founder experience documented', check: () => !!input.intakeData?.founderExperience },
      { key: 'domainExpertise', label: 'Domain expertise present', check: () => !!input.intakeData?.domainExpertise },
      { key: 'relevantSkills', label: 'Relevant skills (2+)', check: () => (input.intakeData?.relevantSkills?.length || 0) >= 2 },
    ];

    const itemsHit: string[] = [];
    const itemsMissed: string[] = [];

    items.forEach(item => {
      if (item.check()) {
        itemsHit.push(item.label);
      } else {
        itemsMissed.push(item.label);
      }
    });

    const score = (itemsHit.length / items.length) * 100;

    const suggestions: string[] = [];
    if (!input.intakeData?.domainExpertise) {
      suggestions.push('Highlight your domain expertise or industry knowledge');
    }
    if ((input.intakeData?.relevantSkills?.length || 0) < 2) {
      suggestions.push('List relevant skills that give you an edge in this market');
    }

    return {
      score,
      explanation: `Founder-Market Fit: ${itemsHit.length}/${items.length} criteria met`,
      itemsHit,
      itemsMissed,
      suggestions,
    };
  }

  private static scoreEvidenceCompleteness(input: ScoringInput): DimensionScore {
    const items = [
      { key: 'intake', label: 'Intake data complete', check: () => !!input.intakeData },
      { key: 'market', label: 'Market research complete', check: () => !!input.marketData },
      { key: 'icp', label: 'ICP defined', check: () => !!input.icpData },
      { key: 'validation', label: 'Validation tests present', check: () => input.validationTests.length > 0 },
      { key: 'positioning', label: 'Positioning drafted', check: () => !!input.positioningData },
    ];

    const itemsHit: string[] = [];
    const itemsMissed: string[] = [];

    items.forEach(item => {
      if (item.check()) {
        itemsHit.push(item.label);
      } else {
        itemsMissed.push(item.label);
      }
    });

    const score = (itemsHit.length / items.length) * 100;

    const suggestions: string[] = [];
    if (!input.validationTests.length) {
      suggestions.push('Add validation tests to strengthen your evidence base');
    }
    if (!input.positioningData) {
      suggestions.push('Complete the positioning step');
    }

    return {
      score,
      explanation: `Evidence Completeness: ${itemsHit.length}/${items.length} sections complete`,
      itemsHit,
      itemsMissed,
      suggestions,
    };
  }

  private static computeConfidence(input: ScoringInput, evidenceScore: number): ConfidenceLevel {
    const hardSignals = input.validationTests.filter(t => t.isHardSignal).length;
    const testDiversity = new Set(input.validationTests.map(t => t.type)).size;
    const totalTests = input.validationTests.length;

    let confidencePoints = 0;

    if (evidenceScore >= 80) confidencePoints += 2;
    else if (evidenceScore >= 60) confidencePoints += 1;

    if (hardSignals >= 2) confidencePoints += 2;
    else if (hardSignals >= 1) confidencePoints += 1;

    if (testDiversity >= 3 && totalTests >= 5) confidencePoints += 2;
    else if (testDiversity >= 2 && totalTests >= 3) confidencePoints += 1;

    if (confidencePoints >= 5) return 'HIGH';
    if (confidencePoints >= 3) return 'MEDIUM';
    return 'LOW';
  }

  private static computeRecommendation(score: number, confidence: ConfidenceLevel): Recommendation {
    if (score >= 75 && confidence !== 'LOW') {
      return 'GO';
    }
    if (score >= 55 && score < 75) {
      return 'CONDITIONAL_GO';
    }
    if (score >= 75 && confidence === 'LOW') {
      return 'CONDITIONAL_GO';
    }
    return 'NO_GO';
  }
}
