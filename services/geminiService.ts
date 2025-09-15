// Service for handling AI analysis and goal planning
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialGoalSetupData, PersonalGoalSetupData, FinancialGoal, PersonalGoal, WeeklyTask, AIInsight } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Response schemas to ensure consistent AI output format
const financialGoalAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        isFeasible: { type: Type.BOOLEAN },
        reasoning: { type: Type.STRING },
        realisticTimeline: { type: Type.STRING },
        estimatedCost: { type: Type.INTEGER },
        weeklySavingsTarget: { type: Type.INTEGER },
    }
};

const personalGoalAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        isFeasible: { type: Type.BOOLEAN },
        reasoning: { type: Type.STRING },
        realisticTimeline: { type: Type.STRING },
        firstWeekTasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    }
};

const weeklyUpdateSchema = {
  type: Type.OBJECT,
  properties: {
      nextWeekTasks: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of 3-5 specific, actionable tasks for the upcoming week based on last week's performance. Adjust difficulty accordingly."
      },
      insight: {
          type: Type.OBJECT,
          properties: {
              type: { type: Type.STRING, enum: ['financial', 'personal', 'cross-goal', 'motivational'] },
              text: { type: Type.STRING, description: "A short, encouraging, and insightful observation about the user's progress or patterns." }
          }
      }
  }
};


// Analyze financial goals and create realistic savings plans
export const getFinancialGoalAnalysis = async (data: FinancialGoalSetupData) => {
    const prompt = `
      A user is setting up a financial goal. Analyze the feasibility and provide a structured plan.
  
      USER DATA:
      - Monthly Income: £${data.income}
      - Monthly Housing Cost: £${data.housingCost}
      - Financial Goal: Buy a ${data.savingsGoal}
      - Desired Financial Timeline: ${data.savingsTimeline}
  
      INSTRUCTIONS:
      1.  **Financial Analysis**:
          -   Estimate the cost of the '${data.savingsGoal}'. Be realistic.
          -   Calculate disposable income (Income - Housing).
          -   Determine if saving for the item within the '${data.savingsTimeline}' is feasible.
          -   If not feasible, suggest a more realistic timeline.
          -   Calculate a weekly savings target based on the realistic timeline.
          -   Provide brief reasoning for your assessment.
      
      Provide the response in the specified JSON format.
    `;
  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: financialGoalAnalysisSchema,
      },
    });
  
    const result = JSON.parse(response.text);
    
    const newFinancialGoal: Omit<FinancialGoal, 'id' | 'status'> = {
      itemName: data.savingsGoal,
      targetAmount: result.estimatedCost,
      targetDate: result.realisticTimeline,
      currentAmount: 0,
      timelineAnalysis: result.reasoning,
      weeklySavingsTarget: result.weeklySavingsTarget,
      savingsHistory: [],
    };
  
    return { newFinancialGoal };
};

// Break down personal goals into manageable weekly tasks
export const getPersonalGoalAnalysis = async (data: PersonalGoalSetupData) => {
    const prompt = `
      A user is setting up a personal goal. Analyze the feasibility and provide a structured plan.
  
      USER DATA:
      - Goal Type: ${data.goalType}
      - Personal Goal: ${data.personalGoal}
      - Desired Personal Timeline: ${data.personalTimeline}
      - Current Skill Level for Personal Goal: ${data.currentSkillLevel}
      - Daily Time Available: ${data.dailyTimeAvailable}
  
      INSTRUCTIONS:
      1.  **Personal Goal Analysis**:
          -   Assess if '${data.personalGoal}' is achievable in '${data.personalTimeline}' given their stated skill level and daily time commitment.
          -   If not, suggest a more realistic timeline or a more achievable first milestone (e.g., "conversational" instead of "fluent").
          -   Provide brief reasoning.
          -   Break down the personal goal into 3-5 specific, actionable tasks for the very first week, considering their available time.
      
      Provide the response in the specified JSON format.
    `;
  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: personalGoalAnalysisSchema,
      },
    });
  
    const result = JSON.parse(response.text);
  
    const newPersonalGoal: Omit<PersonalGoal, 'id' | 'status'> = {
      description: data.personalGoal,
      targetDate: result.realisticTimeline,
      currentLevel: data.currentSkillLevel,
      goalType: data.goalType,
      dailyTimeAvailable: data.dailyTimeAvailable,
      timelineAnalysis: result.reasoning,
      taskHistory: [result.firstWeekTasks.map((task: string) => ({ id: crypto.randomUUID(), description: task, completed: false, isCustom: false }))],
      currentWeek: 1,
      completionHistory: [],
    };
  
    return { newPersonalGoal };
};


// Generate weekly progress updates and next week's tasks
export const getWeeklyUpdate = async (
    financialGoal: FinancialGoal,
    personalGoal: PersonalGoal,
    savedAmount: number,
    completedTaskIds: string[]
) => {
    // Calculate progress metrics for the week
    const currentWeekIndex = personalGoal.currentWeek - 1;
    const lastWeekTasks = personalGoal.taskHistory[currentWeekIndex] || [];
    const completedTasksCount = completedTaskIds.length;
    const totalTasksCount = lastWeekTasks.length;
    
    const lastWeekTasksString = lastWeekTasks.map(t => `- ${t.description} (${completedTaskIds.includes(t.id) ? 'Completed' : 'Not Completed'})`).join('\n');
    
    const prompt = `
    A user is doing their weekly check-in for week ${personalGoal.currentWeek}. Analyze their progress and generate next week's plan and an insight.

    FINANCIAL GOAL: Buy a ${financialGoal.itemName} for £${financialGoal.targetAmount}.
    - Weekly Savings Target: £${financialGoal.weeklySavingsTarget}
    - This Week's Saved Amount: £${savedAmount}
    - Savings History (last 5 weeks): ${JSON.stringify(financialGoal.savingsHistory.slice(-5))}

    PERSONAL GOAL: ${personalGoal.description}.
    - Last Week's Tasks (Week ${personalGoal.currentWeek}):
    ${lastWeekTasksString}
    - Completion Rate: ${completedTasksCount} out of ${totalTasksCount} tasks completed.
    - Completion History (last 5 weeks): ${JSON.stringify(personalGoal.completionHistory.slice(-5))}

    INSTRUCTIONS:
    1.  **Generate Tasks for Next Week (Week ${personalGoal.currentWeek + 1})**:
        -   Based on last week's completion rate (${totalTasksCount > 0 ? (completedTasksCount/totalTasksCount)*100 : 0}%), create 3-5 new tasks for the upcoming week.
        -   If the user struggled (less than 50% completion), make the tasks easier or fewer.
        -   If the user succeeded (over 80% completion), slightly increase the difficulty or scope.
        -   If they were in between, maintain a similar level of difficulty.
    2.  **Generate an Insight**:
        -   Analyze both financial and personal progress.
        -   Look for patterns. Did they save more when they completed more tasks?
        -   Provide ONE short, powerful insight. It can be financial, personal, a cross-goal observation, or a motivational quote. Make it relevant to their recent performance. For example, if they did well on both, celebrate it. If they struggled with one, be encouraging.

    Provide the response in the specified JSON format.
  `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: weeklyUpdateSchema,
        },
    });

    const result = JSON.parse(response.text);

    // Update financial progress
    const updatedFinancialGoal = { ...financialGoal };
    updatedFinancialGoal.currentAmount += savedAmount;
    updatedFinancialGoal.savingsHistory.push({ week: financialGoal.savingsHistory.length + 1, amount: savedAmount });

    // Update personal goal progress
    const updatedPersonalGoal = { ...personalGoal };
    
    // Mark tasks as completed based on user input
    if(updatedPersonalGoal.taskHistory[currentWeekIndex]) {
        updatedPersonalGoal.taskHistory[currentWeekIndex] = updatedPersonalGoal.taskHistory[currentWeekIndex].map(task => ({
            ...task,
            completed: completedTaskIds.includes(task.id),
        }));
    }

    // Create tasks for next week based on AI recommendations
    const newAiTasks = result.nextWeekTasks.map((task: string): WeeklyTask => ({
      id: crypto.randomUUID(),
      description: task,
      completed: false,
      isCustom: false,
    }));
    
    // Add tasks to the next week's schedule
    if (updatedPersonalGoal.taskHistory.length === updatedPersonalGoal.currentWeek) {
        updatedPersonalGoal.taskHistory.push(newAiTasks);
    } else {
        updatedPersonalGoal.taskHistory[updatedPersonalGoal.currentWeek] = newAiTasks;
    }

    // Record this week's completion stats
    updatedPersonalGoal.completionHistory.push({
      week: updatedPersonalGoal.currentWeek,
      completedTasks: completedTasksCount,
      totalTasks: totalTasksCount
    });

    // Move to next week
    updatedPersonalGoal.currentWeek += 1;


    // Package the AI-generated insight
    const newInsight: AIInsight = {
        id: crypto.randomUUID(),
        type: result.insight.type,
        text: result.insight.text,
        date: new Date().toISOString(),
    };
    
    return { updatedFinancialGoal, updatedPersonalGoal, newInsight };
};