// Demo seed data for MemoryVault
export type DocCategory =
  | "Placement Notice"
  | "Offer Letter"
  | "Identity"
  | "Education"
  | "Finance"
  | "Email"
  | "Screenshot"
  | "Certificate"
  | "Bill";

export type Doc = {
  id: string;
  title: string;
  filename: string;
  category: DocCategory;
  documentType?: string;
  kind: "pdf" | "image" | "email";
  uploadedAt: string; // ISO
  date?: string; // event date extracted
  tags: string[];
  important?: boolean;
  summary: string;
  fields?: Record<string, string>;
  excerpt: string;
  filePath?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  dates?: string[];
  companies?: string[];
  salaries?: string[];
  entities?: string[];
};

const now = new Date();
const iso = (offsetDays: number) =>
  new Date(now.getTime() - offsetDays * 86400000).toISOString();
const future = (offsetDays: number) =>
  new Date(now.getTime() + offsetDays * 86400000).toISOString();

export const docs: Doc[] = [
  {
    id: "doc-nokia",
    title: "Nokia Placement Notice",
    filename: "Nokia_Notice.pdf",
    category: "Placement Notice",
    kind: "pdf",
    uploadedAt: iso(0.1),
    date: future(8),
    tags: ["Nokia", "Placement", "Interview", "Deadline"],
    important: true,
    summary:
      "Online Assessment for Nokia Graduate Engineer role. Role: Software Engineer, CTC ₹14 LPA. OA scheduled 28 June, 7:00 PM IST, 90 minutes, 3 sections.",
    fields: {
      Company: "Nokia",
      Role: "Software Engineer",
      CTC: "₹14,00,000",
      "OA Date": "28 June, 7:00 PM",
      Duration: "90 minutes",
      Eligibility: "CGPA ≥ 7.5",
    },
    excerpt:
      "Selected candidates will appear for an Online Assessment on 28 June at 7:00 PM IST. The test contains aptitude, coding, and a short HR essay…",
  },
  {
    id: "doc-amazon",
    title: "Amazon SDE Internship Offer",
    filename: "Amazon_Offer.pdf",
    category: "Offer Letter",
    kind: "pdf",
    uploadedAt: iso(1),
    date: iso(-2),
    tags: ["Amazon", "Internship", "Offer", "SDE"],
    important: true,
    summary:
      "Six-month SDE Internship offer at Amazon, Bangalore. Stipend ₹85,000/month plus relocation. Joining 4 August. Acceptance deadline 5 days.",
    fields: {
      Company: "Amazon",
      Role: "SDE Intern",
      Stipend: "₹85,000 / month",
      Location: "Bangalore",
      "Start Date": "4 August",
      "Accept By": "5 days",
    },
    excerpt:
      "We are pleased to extend an offer for the position of Software Development Engineer Intern. Your stipend will be ₹85,000 per month…",
  },
  {
    id: "doc-pan",
    title: "PAN Card",
    filename: "PAN_Card.jpg",
    category: "Identity",
    kind: "image",
    uploadedAt: iso(120),
    tags: ["PAN", "Identity", "Government"],
    important: true,
    summary:
      "Permanent Account Number issued by Income Tax Department. Use for KYC, salary onboarding, and bank verifications.",
    fields: {
      Name: "Sai Krishna",
      "PAN Number": "ABCDE1234F",
      DOB: "12 / 05 / 2003",
      Father: "R. Subramaniam",
    },
    excerpt: "Permanent Account Number — INCOME TAX DEPARTMENT, GOVT. OF INDIA",
  },
  {
    id: "doc-aadhaar",
    title: "Aadhaar Card",
    filename: "Aadhaar.pdf",
    category: "Identity",
    kind: "pdf",
    uploadedAt: iso(180),
    tags: ["Aadhaar", "Identity", "UIDAI"],
    important: true,
    summary: "Aadhaar card issued by UIDAI. Linked to PAN and mobile number.",
    fields: {
      Name: "Sai Krishna",
      "Aadhaar No.": "XXXX XXXX 4523",
      DOB: "12 / 05 / 2003",
    },
    excerpt: "Government of India — Unique Identification Authority of India.",
  },
  {
    id: "doc-resume",
    title: "Resume — Sai Krishna",
    filename: "Resume_v4.pdf",
    category: "Education",
    kind: "pdf",
    uploadedAt: iso(95),
    tags: ["Resume", "CV", "Job"],
    summary:
      "CSE undergraduate at BITS Pilani. 3 internships, 2 published projects, CGPA 8.6. Last updated 3 months ago — consider refresh.",
    fields: {
      Degree: "B.E. Computer Science",
      College: "BITS Pilani",
      CGPA: "8.6",
      Updated: "3 months ago",
    },
    excerpt: "Software engineer with experience in distributed systems, React…",
  },
  {
    id: "doc-electric",
    title: "Electricity Bill — May 2026",
    filename: "Electricity_May.pdf",
    category: "Bill",
    kind: "pdf",
    uploadedAt: iso(20),
    date: iso(20),
    tags: ["Bill", "Electricity", "BESCOM"],
    summary:
      "BESCOM monthly bill. Amount due ₹1,247. Due date 2 July. Auto-pay not enabled.",
    fields: {
      Amount: "₹1,247",
      Provider: "BESCOM",
      "Due Date": "2 July",
      Units: "182 kWh",
    },
    excerpt:
      "Bangalore Electricity Supply Company — Account No. BS-1923-44. Total units consumed: 182 kWh…",
  },
  {
    id: "doc-internship",
    title: "Razorpay Internship Certificate",
    filename: "Razorpay_Cert.pdf",
    category: "Certificate",
    kind: "pdf",
    uploadedAt: iso(60),
    date: iso(75),
    tags: ["Razorpay", "Internship", "Certificate"],
    summary:
      "Completion certificate for 3-month Backend Internship at Razorpay. Stipend was ₹60,000/month.",
    fields: {
      Company: "Razorpay",
      Duration: "3 months",
      Stipend: "₹60,000 / month",
      Role: "Backend Intern",
    },
    excerpt: "This is to certify that Sai Krishna successfully completed…",
  },
  {
    id: "doc-google",
    title: "Google STEP Application Confirmation",
    filename: "Google_STEP_Email.eml",
    category: "Email",
    kind: "email",
    uploadedAt: iso(40),
    date: iso(40),
    tags: ["Google", "STEP", "Application"],
    summary:
      "Confirmation from Google recruiting that STEP application has been received. Next step in 2 weeks.",
    fields: {
      From: "noreply@google.com",
      Subject: "Your STEP application",
      "Next Step": "2 weeks",
    },
    excerpt: "Hi Sai, thanks for applying to the STEP 2026 program at Google…",
  },
  {
    id: "doc-college",
    title: "College Circular — Mid-sem Schedule",
    filename: "Midsem_Circular.pdf",
    category: "Education",
    kind: "pdf",
    uploadedAt: iso(15),
    date: future(20),
    tags: ["College", "Exam", "Schedule"],
    summary:
      "Mid-semester examination schedule. Exams from 12–18 July. Hall ticket required.",
    fields: {
      Start: "12 July",
      End: "18 July",
      Hall: "Block C, Room 204",
    },
    excerpt: "All students are notified that mid-semester exams will be held…",
  },
  {
    id: "doc-degree",
    title: "Class XII Marksheet",
    filename: "12th_Marksheet.pdf",
    category: "Education",
    kind: "pdf",
    uploadedAt: iso(500),
    tags: ["Marksheet", "CBSE", "12th"],
    important: true,
    summary: "CBSE Class XII marksheet. Percentage 94.6%. PCM stream.",
    fields: {
      Board: "CBSE",
      Year: "2021",
      Percentage: "94.6%",
    },
    excerpt: "Central Board of Secondary Education — Senior School Certificate…",
  },
  {
    id: "doc-rent",
    title: "Rent Receipt — June 2026",
    filename: "Rent_June.pdf",
    category: "Finance",
    kind: "pdf",
    uploadedAt: iso(10),
    tags: ["Rent", "Receipt"],
    summary: "Monthly rent receipt. ₹18,000 paid to landlord on 1 June.",
    fields: { Amount: "₹18,000", "Paid On": "1 June" },
    excerpt: "Received from Mr. Sai Krishna the sum of Rupees Eighteen Thousand…",
  },
  {
    id: "doc-otp",
    title: "HDFC OTP Screenshot",
    filename: "OTP_HDFC.png",
    category: "Screenshot",
    kind: "image",
    uploadedAt: iso(3),
    tags: ["HDFC", "OTP", "Banking"],
    summary: "Saved OTP screenshot from HDFC. Transaction ₹4,200 to Swiggy.",
    excerpt: "HDFC Bank: OTP 824193 for ₹4,200.00 at SWIGGY. Valid 5 min.",
  },
];

export const stats = {
  documents: 132,
  screenshots: 824,
  emails: 57,
  upcomingDeadlines: 4,
  storageMb: 84,
};

export const deadlines = [
  { id: "d1", title: "Nokia Online Assessment", in: "2 days left", source: "doc-nokia" },
  { id: "d2", title: "Amazon Offer Acceptance", in: "5 days left", source: "doc-amazon" },
  { id: "d3", title: "Electricity Bill Due", in: "9 days left", source: "doc-electric" },
  { id: "d4", title: "Mid-sem exams begin", in: "20 days left", source: "doc-college" },
];

export const insights = [
  {
    type: "deadline" as const,
    title: "Upcoming deadline",
    body: "Nokia Online Assessment — 28 June, 7:00 PM",
    docId: "doc-nokia",
  },
  {
    type: "stale" as const,
    title: "Document possibly outdated",
    body: "Your resume hasn't been updated in 3 months.",
    docId: "doc-resume",
  },
  {
    type: "important" as const,
    title: "Identity verified",
    body: "PAN and Aadhaar are uploaded and current.",
    docId: "doc-pan",
  },
  {
    type: "money" as const,
    title: "₹1,247 due in 9 days",
    body: "BESCOM electricity bill for May 2026.",
    docId: "doc-electric",
  },
];

// Timeline events extracted from docs
export const timeline = [
  { id: "t1", date: "Jan 2026", title: "Applied to Nokia placement", group: "Work", docId: "doc-nokia" },
  { id: "t2", date: "Feb 2026", title: "Uploaded resume v4", group: "Work", docId: "doc-resume" },
  { id: "t3", date: "Mar 2026", title: "Razorpay internship completed", group: "Work", docId: "doc-internship" },
  { id: "t4", date: "Apr 2026", title: "Applied to Google STEP", group: "Work", docId: "doc-google" },
  { id: "t5", date: "May 2026", title: "Electricity bill ₹1,247", group: "Finance", docId: "doc-electric" },
  { id: "t6", date: "Jun 2026", title: "Amazon offer received", group: "Work", docId: "doc-amazon" },
  { id: "t7", date: "Jun 2026", title: "College mid-sem circular", group: "Education", docId: "doc-college" },
];

// Lightweight keyword-driven AI response engine
export function answerQuery(q: string): {
  text: string;
  sources: { docId: string; title: string }[];
} {
  const query = q.toLowerCase().trim();
  const hits: Doc[] = [];

  for (const d of docs) {
    const hay = (
      d.title +
      " " +
      d.tags.join(" ") +
      " " +
      d.summary +
      " " +
      d.excerpt +
      " " +
      d.category +
      " " +
      Object.values(d.fields ?? {}).join(" ")
    ).toLowerCase();
    const words = query.split(/\W+/).filter((w) => w.length > 2);
    if (words.some((w) => hay.includes(w))) hits.push(d);
  }

  if (hits.length === 0) {
    return {
      text: "I couldn't find anything matching that in your vault yet. Try uploading the document or rephrasing — e.g. \"Nokia\", \"PAN card\", or \"electricity bill\".",
      sources: [],
    };
  }

  const top = hits[0];
  const body = `**${top.title}** — ${top.summary}${
    top.fields
      ? "\n\n" +
        Object.entries(top.fields)
          .map(([k, v]) => `- **${k}:** ${v}`)
          .join("\n")
      : ""
  }`;
  return {
    text: body,
    sources: hits.slice(0, 3).map((d) => ({ docId: d.id, title: d.title })),
  };
}

export const exampleQueries = [
  "When is my Nokia interview?",
  "Where is my PAN card?",
  "What was my internship salary at Razorpay?",
  "Show upcoming deadlines",
  "Find the latest electricity bill",
  "What did Google email me about STEP?",
];
