import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const HR_SYSTEM_PROMPT = `You are an AI HR assistant for a Human Resource Management System (HRMS). You help with:

1. **Employee Management**: Queries about employee records, departments, designations, and organizational structure.
2. **Attendance & Leave**: Questions about attendance policies, leave balances, leave types, and holiday calendars.
3. **Payroll**: Salary structures, deductions, tax calculations, and payroll processing.
4. **Recruitment**: Job postings, candidate pipeline, interview scheduling, and hiring workflows.
5. **Performance**: Review cycles, OKRs, feedback, ratings, and attrition risk analysis.
6. **Learning & Development**: Training courses, skill assessments, certifications, and enrollment.
7. **Company Policies**: Leave policies, expense policies, code of conduct, and compliance.
8. **Expenses**: Expense categories, approval workflows, reimbursement processes.

Guidelines:
- Provide accurate, professional HR advice
- Reference common HR best practices and compliance standards
- Be helpful and empathetic in your responses
- When specific data is needed, suggest the user check the relevant section in the HRMS
- Keep responses concise but informative
- If you're unsure about company-specific policies, recommend checking with HR department
- Format responses with clear structure using markdown when appropriate`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      );
    }

    const { message, conversationHistory } = body;

    // Build messages array for the AI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: HR_SYSTEM_PROMPT },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Add the current user message
    messages.push({ role: 'user', content: message });

    // Call the AI SDK using the async create pattern
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages,
    });

    const aiMessage = response.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

    return NextResponse.json({
      message: aiMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
