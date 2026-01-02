
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AppState } from "../types";

export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const summary = {
    totalIncome: state.transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0),
    totalExpenses: state.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0),
    topExpenseCategories: Object.entries(
      state.transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>)
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  };

  const prompt = `
    Act as a wise biblical financial counselor. 
    Analyze this financial situation:
    Total Income: P${summary.totalIncome}
    Total Expenses: P${summary.totalExpenses}
    Top Expenses: ${summary.topExpenseCategories.map(([cat, amt]) => `${cat} (P${amt})`).join(', ')}
    
    Provide a relevant and encouraging King James Version (KJV) Bible verse that relates to stewardship, wisdom, or financial peace. 
    Follow the verse with a single short sentence of professional encouragement.
    Do not use any Setswana words. 
    Output format: "[Verse Reference]: [Verse Text] [One short encouraging sentence]"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 150,
        temperature: 0.7,
      }
    });
    return response.text || "Proverbs 21:20: There is treasure to be desired and oil in the dwelling of the wise; but a foolish man spendeth it up. Stay diligent in your stewardship.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Philippians 4:19: But my God shall supply all your need according to his riches in glory by Christ Jesus. Trust in the process of wise management.";
  }
};
