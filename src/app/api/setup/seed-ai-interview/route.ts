import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST() {
  try {
    const company = await db.company.findFirst({ where: { code: 'MARQ' } });
    if (!company) {
      return NextResponse.json({ error: 'MARQ company not found. Run comprehensive seed first.' }, { status: 400 });
    }

    let jobs = await db.job.findMany({ where: { companyId: company.id }, take: 5 });
    
    if (jobs.length === 0) {
      const jobData = [
        { title: 'Senior Full Stack Developer', department: 'Engineering', location: 'Bangalore', employmentType: 'full-time', experienceMin: 3, experienceMax: 7, salaryMin: 1500000, salaryMax: 3000000, status: 'active', priority: 'high', positions: 2, requirements: JSON.stringify(['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS']), companyId: company.id },
        { title: 'Data Scientist', department: 'Analytics', location: 'Mumbai', employmentType: 'full-time', experienceMin: 2, experienceMax: 5, salaryMin: 1200000, salaryMax: 2500000, status: 'active', priority: 'high', positions: 1, requirements: JSON.stringify(['Python', 'Machine Learning', 'SQL', 'TensorFlow']), companyId: company.id },
        { title: 'HR Business Partner', department: 'Human Resources', location: 'Bangalore', employmentType: 'full-time', experienceMin: 5, experienceMax: 10, salaryMin: 1000000, salaryMax: 2000000, status: 'active', priority: 'medium', positions: 1, requirements: JSON.stringify(['HR Management', 'Employee Relations', 'Talent Development']), companyId: company.id },
        { title: 'Cloud DevOps Engineer', department: 'Engineering', location: 'Hyderabad', employmentType: 'full-time', experienceMin: 3, experienceMax: 6, salaryMin: 1300000, salaryMax: 2800000, status: 'active', priority: 'high', positions: 1, requirements: JSON.stringify(['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform']), companyId: company.id },
        { title: 'Product Manager', department: 'Engineering', location: 'Bangalore', employmentType: 'full-time', experienceMin: 4, experienceMax: 8, salaryMin: 1800000, salaryMax: 3500000, status: 'active', priority: 'medium', positions: 1, requirements: JSON.stringify(['Product Strategy', 'Agile', 'Data Analysis']), companyId: company.id },
      ];
      for (const jd of jobData) {
        jobs.push(await db.job.create({ data: jd }));
      }
    }

    let candidates = await db.candidate.findMany({ take: 5 });
    if (candidates.length < 5) {
      const candidateData = [
        { firstName: 'Ananya', lastName: 'Sharma', email: 'ananya.ai.interview@email.com', phone: '+919876543210', currentCompany: 'Infosys', currentTitle: 'Senior Developer', experience: 5, expectedSalary: 2000000, noticePeriod: '30 days', status: 'interviewed', source: 'linkedin', aiScore: 85, skillMatch: 92, cultureFitScore: 88, jobId: jobs[0].id },
        { firstName: 'Rahul', lastName: 'Patel', email: 'rahul.ai.interview@email.com', phone: '+919123456789', currentCompany: 'Wipro', currentTitle: 'Data Analyst', experience: 3, expectedSalary: 1500000, noticePeriod: '60 days', status: 'interviewed', source: 'referral', aiScore: 78, skillMatch: 85, cultureFitScore: 82, jobId: jobs[1 % jobs.length].id },
        { firstName: 'Priya', lastName: 'Gupta', email: 'priya.ai.interview@email.com', phone: '+919876543211', currentCompany: 'TCS', currentTitle: 'HR Executive', experience: 7, expectedSalary: 1800000, noticePeriod: '90 days', status: 'applied', source: 'naukri', aiScore: 72, skillMatch: 80, cultureFitScore: 90, jobId: jobs[2 % jobs.length].id },
        { firstName: 'Vikram', lastName: 'Singh', email: 'vikram.ai.interview@email.com', phone: '+919876543212', currentCompany: 'Amazon', currentTitle: 'DevOps Lead', experience: 6, expectedSalary: 2800000, noticePeriod: '30 days', status: 'shortlisted', source: 'linkedin', aiScore: 91, skillMatch: 95, cultureFitScore: 87, jobId: jobs[3 % jobs.length].id },
        { firstName: 'Meera', lastName: 'Krishnan', email: 'meera.ai.interview@email.com', phone: '+919876543213', currentCompany: 'Flipkart', currentTitle: 'Associate PM', experience: 4, expectedSalary: 2200000, noticePeriod: '60 days', status: 'interviewed', source: 'internal', aiScore: 83, skillMatch: 88, cultureFitScore: 91, jobId: jobs[4 % jobs.length].id },
      ];
      for (const cd of candidateData) {
        try { candidates.push(await db.candidate.create({ data: cd })); } catch { /* skip dupes */ }
      }
    }

    const existingInterviews = await db.aIInterview.count();
    if (existingInterviews > 0) {
      return NextResponse.json({ message: 'AI Interview data already exists', count: existingInterviews });
    }

    const q1 = [
      { question: 'Walk me through a challenging project you led and the outcomes you achieved.', category: 'Technical', evaluationCriteria: 'Depth of experience, project ownership, measurable outcomes' },
      { question: 'How do you approach problem-solving when faced with an unfamiliar technical challenge?', category: 'Problem Solving', evaluationCriteria: 'Analytical thinking, resourcefulness, structured approach' },
      { question: 'Describe your experience working in cross-functional teams. How do you handle differing opinions?', category: 'Communication', evaluationCriteria: 'Collaboration skills, conflict resolution, empathy' },
      { question: 'What attracts you to our company culture, and how do you see yourself contributing?', category: 'Culture Fit', evaluationCriteria: 'Values alignment, motivation, team contribution' },
      { question: 'Tell me about a time you had to learn a new technology quickly. How did you approach it?', category: 'Technical', evaluationCriteria: 'Learning agility, adaptability, self-direction' },
      { question: 'How do you prioritize tasks when you have multiple deadlines approaching simultaneously?', category: 'Problem Solving', evaluationCriteria: 'Time management, prioritization frameworks, composure under pressure' },
      { question: 'Describe a situation where you had to communicate complex information to a non-technical audience.', category: 'Communication', evaluationCriteria: 'Clarity, audience awareness, simplification skills' },
      { question: 'What does continuous improvement mean to you, and how have you applied it in your work?', category: 'Culture Fit', evaluationCriteria: 'Growth mindset, self-awareness, actionable improvement' },
    ];

    const r1 = [
      { questionIndex: 0, question: q1[0].question, answer: 'I led the migration of our legacy monolith to microservices. We reduced deployment time from 4 hours to 15 minutes and improved system reliability by 99.9%. I coordinated with 3 teams and managed the migration over 6 months with zero downtime.', score: 92, aiEvaluation: 'Excellent project ownership with measurable outcomes.' },
      { questionIndex: 1, question: q1[1].question, answer: 'I start by understanding the problem space thoroughly, break it down into smaller components, research existing solutions, and build a proof of concept. For example, when I encountered a distributed caching issue, I prototyped 3 approaches before selecting Redis Cluster.', score: 88, aiEvaluation: 'Structured and methodical approach.' },
      { questionIndex: 2, question: q1[2].question, answer: 'I believe in active listening and finding common ground. When our design and engineering teams disagreed on an API structure, I facilitated a workshop where both sides presented their concerns, and we reached a solution.', score: 90, aiEvaluation: 'Strong collaboration and conflict resolution skills.' },
      { questionIndex: 3, question: q1[3].question, answer: 'I admire your focus on innovation and employee growth. The hackathon culture resonates with me. I would contribute by bringing my experience in building scalable systems and mentoring junior developers.', score: 85, aiEvaluation: 'Good alignment with company values.' },
      { questionIndex: 4, question: q1[4].question, answer: 'When we needed to adopt GraphQL quickly, I dedicated 2 hours daily to learning, built a small project, and within 3 weeks led the implementation in our production app. I also created a knowledge-sharing session for the team.', score: 91, aiEvaluation: 'Excellent learning agility and team enablement.' },
      { questionIndex: 5, question: q1[5].question, answer: 'I use the Eisenhower Matrix combined with sprint planning. Critical and urgent items get immediate attention, but I also allocate time for important but non-urgent tasks.', score: 87, aiEvaluation: 'Effective prioritization framework.' },
      { questionIndex: 6, question: q1[6].question, answer: 'I always start with the why before the how. When explaining our ML model to the marketing team, I used analogies from their domain and created visual dashboards instead of technical reports.', score: 89, aiEvaluation: 'Excellent communication adaptation.' },
      { questionIndex: 7, question: q1[7].question, answer: 'Continuous improvement means never settling for the status quo. I conduct monthly retrospectives on my own work, seek feedback proactively, and dedicate time each week to learning something new.', score: 86, aiEvaluation: 'Strong growth mindset with concrete examples.' },
    ];

    const feedback1 = {
      overallScore: 89, categoryScores: { technical: 91, communication: 89, problemSolving: 88, cultureFit: 86 },
      strengths: ['Excellent project ownership with measurable outcomes', 'Strong learning agility and team enablement', 'Effective communication adaptation'],
      weaknesses: ['Could elaborate more on long-term strategic thinking'],
      recommendation: 'Strong Hire',
      summary: 'Ananya demonstrates exceptional technical depth combined with strong communication and collaboration skills. Outstanding candidate.'
    };

    const r2 = [
      { questionIndex: 0, question: q1[0].question, answer: 'I worked on a real-time data pipeline that processed 10M events/day. The challenge was handling backpressure during peak hours.', score: 78, aiEvaluation: 'Good technical experience.' },
      { questionIndex: 1, question: q1[1].question, answer: 'I typically search for solutions online, check documentation, and ask colleagues.', score: 72, aiEvaluation: 'Practical but could be more structured.' },
      { questionIndex: 2, question: q1[2].question, answer: 'I try to understand the other perspective first. In my current role, I worked with product managers who had different priorities, and we found a compromise.', score: 80, aiEvaluation: 'Good collaboration approach.' },
      { questionIndex: 3, question: q1[3].question, answer: 'Your company has an impressive tech stack and I appreciate the focus on work-life balance.', score: 75, aiEvaluation: 'Reasonable alignment.' },
      { questionIndex: 4, question: q1[4].question, answer: 'I learned Kubernetes by taking an online course and setting up a home lab. Within a month, I was managing our staging clusters.', score: 82, aiEvaluation: 'Good self-directed learning.' },
      { questionIndex: 5, question: q1[5].question, answer: 'I use Jira to track all my tasks and block time in my calendar for focused work.', score: 76, aiEvaluation: 'Practical task management approach.' },
      { questionIndex: 6, question: q1[6].question, answer: 'I create visual presentations and avoid jargon when presenting to business stakeholders.', score: 79, aiEvaluation: 'Good simplification approach.' },
      { questionIndex: 7, question: q1[7].question, answer: 'I regularly read technical blogs and attend meetups. I also contribute to open source projects.', score: 77, aiEvaluation: 'Active learning approach.' },
    ];

    const feedback2 = {
      overallScore: 77, categoryScores: { technical: 80, communication: 79, problemSolving: 74, cultureFit: 76 },
      strengths: ['Solid technical foundation', 'Practical learning approach', 'Good collaboration skills'],
      weaknesses: ['Problem-solving could be more structured', 'Could provide more specific outcomes'],
      recommendation: 'Hire',
      summary: 'Rahul demonstrates solid technical skills and practical experience. A solid hire for a mid-level position with growth potential.'
    };

    const results = [];

    // Interview 1: Completed - Strong Hire
    results.push(await db.aIInterview.create({
      data: {
        candidateId: candidates[0]?.id, jobId: jobs[0]?.id, status: 'completed',
        questions: JSON.stringify(q1), responses: JSON.stringify(r1), score: 89,
        feedback: JSON.stringify(feedback1), language: 'en',
        rubric: JSON.stringify({ technical: 30, communication: 25, problemSolving: 25, cultureFit: 20 }),
        interviewLink: `/interview/${nanoid()}`, resumeUrl: 'https://resumes.example.com/ananya_sharma.pdf',
        cheatingSignals: JSON.stringify([]), cvScore: 82,
        videoTimestamps: JSON.stringify([{ q: 0, s: 0, e: 45 }, { q: 1, s: 46, e: 95 }, { q: 2, s: 96, e: 148 }, { q: 3, s: 149, e: 198 }, { q: 4, s: 199, e: 252 }, { q: 5, s: 253, e: 305 }, { q: 6, s: 306, e: 362 }, { q: 7, s: 363, e: 420 }]),
        transcript: 'Full transcript: Ananya Sharma interview for Senior Full Stack Developer. Candidate demonstrated excellent technical knowledge and communication skills.',
        duration: 32, startedAt: new Date(Date.now() - 7 * 86400000), completedAt: new Date(Date.now() - 7 * 86400000 + 1920000),
      },
    }));

    // Interview 2: Completed - Hire
    results.push(await db.aIInterview.create({
      data: {
        candidateId: candidates[1 % candidates.length]?.id, jobId: jobs[1 % jobs.length]?.id, status: 'completed',
        questions: JSON.stringify(q1), responses: JSON.stringify(r2), score: 77,
        feedback: JSON.stringify(feedback2), language: 'en',
        rubric: JSON.stringify({ technical: 30, communication: 25, problemSolving: 25, cultureFit: 20 }),
        interviewLink: `/interview/${nanoid()}`, resumeUrl: 'https://resumes.example.com/rahul_patel.pdf',
        cheatingSignals: JSON.stringify(['tab_switch_detected']), cvScore: 75,
        videoTimestamps: JSON.stringify([{ q: 0, s: 0, e: 38 }, { q: 1, s: 39, e: 82 }, { q: 2, s: 83, e: 130 }, { q: 3, s: 131, e: 172 }, { q: 4, s: 173, e: 218 }, { q: 5, s: 219, e: 268 }, { q: 6, s: 269, e: 320 }, { q: 7, s: 321, e: 370 }]),
        transcript: 'Full transcript: Rahul Patel interview for Data Scientist position. Solid technical skills with growth potential.',
        duration: 28, startedAt: new Date(Date.now() - 5 * 86400000), completedAt: new Date(Date.now() - 5 * 86400000 + 1680000),
      },
    }));

    // Interview 3: In Progress
    results.push(await db.aIInterview.create({
      data: {
        candidateId: candidates[2 % candidates.length]?.id, jobId: jobs[2 % jobs.length]?.id, status: 'in_progress',
        questions: JSON.stringify(q1.slice(0, 6)),
        responses: JSON.stringify([
          { questionIndex: 0, question: q1[0].question, answer: 'I have 7 years of HR experience. I led the implementation of a performance management system that improved employee satisfaction by 25%.', score: 82, aiEvaluation: 'Strong HR experience with measurable impact.' },
          { questionIndex: 1, question: q1[1].question, answer: 'I approach problems by understanding root cause. When we had high attrition, I conducted stay interviews and found the issue was career growth, then created development paths that reduced attrition by 30%.', score: 85, aiEvaluation: 'Excellent analytical approach.' },
          { questionIndex: 2, question: q1[2].question, answer: 'Cross-functional work is essential in HR. I regularly collaborate with finance on budgeting, engineering on hiring plans, and legal on compliance.', score: 88, aiEvaluation: 'Very strong collaboration framework.' },
        ]),
        language: 'en', interviewLink: `/interview/${nanoid()}`, resumeUrl: 'https://resumes.example.com/priya_gupta.pdf',
        cheatingSignals: JSON.stringify([]), cvScore: 79,
        startedAt: new Date(Date.now() - 86400000),
      },
    }));

    // Interviews 4 & 5: Scheduled
    for (let i = 3; i < 5; i++) {
      results.push(await db.aIInterview.create({
        data: {
          candidateId: candidates[i % candidates.length]?.id, jobId: jobs[i % jobs.length]?.id,
          status: 'scheduled', questions: JSON.stringify([]), responses: JSON.stringify([]),
          language: i === 3 ? 'en' : 'hi', interviewLink: `/interview/${nanoid()}`, cvScore: i === 3 ? 88 : 71,
        },
      }));
    }

    return NextResponse.json({
      success: true,
      message: 'AI Interview sample data created successfully',
      summary: {
        total: results.length,
        completed: results.filter(i => i.status === 'completed').length,
        inProgress: results.filter(i => i.status === 'in_progress').length,
        scheduled: results.filter(i => i.status === 'scheduled').length,
      },
    });
  } catch (error: any) {
    console.error('Error seeding AI interview data:', error);
    return NextResponse.json({ error: 'Failed to seed AI interview data', details: error.message }, { status: 500 });
  }
}
