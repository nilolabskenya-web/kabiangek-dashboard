// ── TPD ICT Integration Quiz ── 25 MCQs from all 4 training modules ──

export interface QuizQuestion {
  id: number;
  module: string;
  question: string;
  options: { label: string; text: string }[];
  answer: string; // "A" | "B" | "C" | "D"
}

export const QUIZ_TITLE = "ICT Integration in Learning — TPD Assessment";
export const QUIZ_TIME_MINUTES = 30;

export const questions: QuizQuestion[] = [
  // ═══ Module 1: ICT Integrated Lesson Planning (5 questions) ═══
  {
    id: 1,
    module: "ICT Integrated Lesson Planning",
    question: "What is the first step when planning an ICT integrated lesson?",
    options: [
      { label: "A", text: "Open a presentation software and start creating slides" },
      { label: "B", text: "Identify a strand and sub-strand from a learning area of your choice" },
      { label: "C", text: "Download videos from YouTube for the lesson" },
      { label: "D", text: "Ask learners to bring their devices to class" },
    ],
    answer: "B",
  },
  {
    id: 2,
    module: "ICT Integrated Lesson Planning",
    question: "Which factor should NOT be considered when planning an ICT integrated lesson?",
    options: [
      { label: "A", text: "Availability of ICT tools" },
      { label: "B", text: "Duration of the lesson" },
      { label: "C", text: "The brand of the computing devices" },
      { label: "D", text: "Catering for learners' diverse needs" },
    ],
    answer: "C",
  },
  {
    id: 3,
    module: "ICT Integrated Lesson Planning",
    question: "According to the training, why should you insert voice overs in a presentation?",
    options: [
      { label: "A", text: "To make the presentation file size larger" },
      { label: "B", text: "To impress other teachers with technical skills" },
      { label: "C", text: "To replace the teacher entirely during the lesson" },
      { label: "D", text: "To enhance understanding for auditory learners and learners with visual impairment" },
    ],
    answer: "D",
  },
  {
    id: 4,
    module: "ICT Integrated Lesson Planning",
    question: "What is the role of human agency when using AI tools for lesson preparation?",
    options: [
      { label: "A", text: "To accept AI-generated content without any changes" },
      { label: "B", text: "To review, compare, and improve AI-generated lesson plans based on professional judgment" },
      { label: "C", text: "To avoid using AI tools completely" },
      { label: "D", text: "To let AI replace all teacher planning activities" },
    ],
    answer: "B",
  },
  {
    id: 5,
    module: "ICT Integrated Lesson Planning",
    question: "What is an important practice after developing ICT integrated lesson materials?",
    options: [
      { label: "A", text: "Delete all materials after use to save storage space" },
      { label: "B", text: "Keep a backup of all lessons and materials in the cloud or other storage media" },
      { label: "C", text: "Share the materials only with the school principal" },
      { label: "D", text: "Print all materials and distribute to learners before the lesson" },
    ],
    answer: "B",
  },

  // ═══ Module 2: Introduction to ICT Integration (6 questions) ═══
  {
    id: 6,
    module: "Introduction to ICT Integration",
    question: "What does ICT integration in learning mean?",
    options: [
      { label: "A", text: "Teaching computer studies as a standalone subject" },
      { label: "B", text: "Buying the most expensive computers for the school" },
      { label: "C", text: "The seamless use of technology to support and enhance learners' engagement and attainment of learning outcomes" },
      { label: "D", text: "Replacing all print textbooks with digital devices" },
    ],
    answer: "C",
  },
  {
    id: 7,
    module: "Introduction to ICT Integration",
    question: "What does TPACK stand for?",
    options: [
      { label: "A", text: "Teaching Practice And Classroom Knowledge" },
      { label: "B", text: "Technology, Pedagogy, And Content Knowledge" },
      { label: "C", text: "Technical Planning And Curriculum Knowledge" },
      { label: "D", text: "Training, Practice, Assessment, and Curriculum Knowledge" },
    ],
    answer: "B",
  },
  {
    id: 8,
    module: "Introduction to ICT Integration",
    question: "In the TPACK model, what does Content Knowledge (CK) refer to?",
    options: [
      { label: "A", text: "Knowledge of how to operate computers and digital devices" },
      { label: "B", text: "Knowledge of classroom management techniques" },
      { label: "C", text: "Knowledge emanating from curriculum documents and deep understanding of concepts" },
      { label: "D", text: "Knowledge of school administration policies" },
    ],
    answer: "C",
  },
  {
    id: 9,
    module: "Introduction to ICT Integration",
    question: "Which of these is NOT a 21st century skill enhanced by ICT integration?",
    options: [
      { label: "A", text: "Critical thinking" },
      { label: "B", text: "Collaboration" },
      { label: "C", text: "Rote memorization" },
      { label: "D", text: "Digital literacy" },
    ],
    answer: "C",
  },
  {
    id: 10,
    module: "Introduction to ICT Integration",
    question: "Which Kenyan policy document is the main framework guiding ICT integration in education and training?",
    options: [
      { label: "A", text: "The Constitution of Kenya, 2010" },
      { label: "B", text: "Kenya Vision 2030" },
      { label: "C", text: "ICT in Education and Training Policy, 2021" },
      { label: "D", text: "Basic Education Act, 2013" },
    ],
    answer: "C",
  },
  {
    id: 11,
    module: "Introduction to ICT Integration",
    question: "Which of the following is a way of integrating ICT in learning?",
    options: [
      { label: "A", text: "Banning all mobile phones in school" },
      { label: "B", text: "Using PowerPoint presentations, videos, and simulations to explain concepts" },
      { label: "C", text: "Teaching only from printed textbooks" },
      { label: "D", text: "Keeping computers locked in the computer lab at all times" },
    ],
    answer: "B",
  },

  // ═══ Module 3: ICT Tools for Learning (9 questions) ═══
  {
    id: 12,
    module: "ICT Tools for Learning",
    question: "Which category of ICT tools includes word processors, spreadsheets, and presentation software?",
    options: [
      { label: "A", text: "Communication tools" },
      { label: "B", text: "Assessment tools" },
      { label: "C", text: "Constructive / Productivity tools" },
      { label: "D", text: "Information tools" },
    ],
    answer: "C",
  },
  {
    id: 13,
    module: "ICT Tools for Learning",
    question: "A teacher wants real-time interaction with learners during an online lesson. Which communication mode should they use?",
    options: [
      { label: "A", text: "Asynchronous tools like email" },
      { label: "B", text: "Synchronous tools like video conferencing" },
      { label: "C", text: "SMS text messaging only" },
      { label: "D", text: "Printed handouts distributed in advance" },
    ],
    answer: "B",
  },
  {
    id: 14,
    module: "ICT Tools for Learning",
    question: "What is a spreadsheet application best used for in a school setting?",
    options: [
      { label: "A", text: "Creating slideshow presentations" },
      { label: "B", text: "Writing lesson notes and schemes of work" },
      { label: "C", text: "Exam analysis, budgeting, and manipulating numerical data" },
      { label: "D", text: "Recording and editing video lessons" },
    ],
    answer: "C",
  },
  {
    id: 15,
    module: "ICT Tools for Learning",
    question: "Which of the following is an example of an assistive technology?",
    options: [
      { label: "A", text: "A standard desktop computer with no modifications" },
      { label: "B", text: "Screen readers and text-to-speech tools for learners with visual impairment" },
      { label: "C", text: "A regular whiteboard marker" },
      { label: "D", text: "A printed textbook" },
    ],
    answer: "B",
  },
  {
    id: 16,
    module: "ICT Tools for Learning",
    question: "Which factor should you consider when selecting ICT tools for learning?",
    options: [
      { label: "A", text: "Whether the tool is the most expensive on the market" },
      { label: "B", text: "Whether the tool was made in Kenya" },
      { label: "C", text: "The tool's availability, accessibility, and whether it supports learning" },
      { label: "D", text: "Whether the tool requires electricity to operate" },
    ],
    answer: "C",
  },
  {
    id: 17,
    module: "ICT Tools for Learning",
    question: "Which of the following is an example of an emerging technology in education?",
    options: [
      { label: "A", text: "A chalkboard" },
      { label: "B", text: "A printed textbook" },
      { label: "C", text: "Virtual and Augmented Reality (VR/AR)" },
      { label: "D", text: "A ballpoint pen" },
    ],
    answer: "C",
  },
  {
    id: 18,
    module: "ICT Tools for Learning",
    question: "How can AI-powered tools support assessment in education?",
    options: [
      { label: "A", text: "By replacing all teachers with robots" },
      { label: "B", text: "By providing automated grading, performance analytics, and real-time progress monitoring" },
      { label: "C", text: "By preventing learners from accessing any digital content" },
      { label: "D", text: "By making all exams paper-based" },
    ],
    answer: "B",
  },
  {
    id: 19,
    module: "ICT Tools for Learning",
    question: "What is a key feature of interactive screen boards?",
    options: [
      { label: "A", text: "They can only display static text" },
      { label: "B", text: "They require no power source" },
      { label: "C", text: "They have a touch-sensitive surface for writing, drawing, and multi-user interaction" },
      { label: "D", text: "They replace the need for a teacher in the classroom" },
    ],
    answer: "C",
  },
  {
    id: 20,
    module: "ICT Tools for Learning",
    question: "Which professional documents can be prepared using a word processor?",
    options: [
      { label: "A", text: "Only personal letters and emails" },
      { label: "B", text: "Lesson plans, schemes of work, and record of work" },
      { label: "C", text: "Only financial spreadsheets" },
      { label: "D", text: "Only presentation slides" },
    ],
    answer: "B",
  },

  // ═══ Module 4: Management, Maintenance & Support (5 questions) ═══
  {
    id: 21,
    module: "Management, Maintenance & Support of ICT",
    question: "What is e-waste?",
    options: [
      { label: "A", text: "Waste from electrical cooking appliances only" },
      { label: "B", text: "Discarded electronic devices and equipment such as computers, mobile phones, and televisions" },
      { label: "C", text: "Paper waste from printing documents" },
      { label: "D", text: "Organic waste from the school garden" },
    ],
    answer: "B",
  },
  {
    id: 22,
    module: "Management, Maintenance & Support of ICT",
    question: "Which body in Kenya provides guidelines and regulations on e-waste management?",
    options: [
      { label: "A", text: "Kenya National Examination Council (KNEC)" },
      { label: "B", text: "Teachers Service Commission (TSC)" },
      { label: "C", text: "National Environment Management Authority (NEMA)" },
      { label: "D", text: "Kenya Institute of Curriculum Development (KICD)" },
    ],
    answer: "C",
  },
  {
    id: 23,
    module: "Management, Maintenance & Support of ICT",
    question: "What is the first basic troubleshooting step when an ICT device fails to work?",
    options: [
      { label: "A", text: "Immediately replace the device with a new one" },
      { label: "B", text: "Call the manufacturer for a refund" },
      { label: "C", text: "Check the power and peripherals connectivity, then restart the device" },
      { label: "D", text: "Format the hard drive and reinstall everything" },
    ],
    answer: "C",
  },
  {
    id: 24,
    module: "Management, Maintenance & Support of ICT",
    question: "The Four-in-Balance ICT Integration Model adopted by Kenya's Ministry of Education has four pillars. Which of these is NOT one of them?",
    options: [
      { label: "A", text: "Policy Formulation" },
      { label: "B", text: "Capacity Building" },
      { label: "C", text: "Profit Generation" },
      { label: "D", text: "ICT Infrastructure" },
    ],
    answer: "C",
  },
  {
    id: 25,
    module: "Management, Maintenance & Support of ICT",
    question: "What is an unethical behaviour in the use of ICT in education?",
    options: [
      { label: "A", text: "Using presentation software to teach a lesson" },
      { label: "B", text: "Sharing your password with colleagues for convenience" },
      { label: "C", text: "Creating a WhatsApp group for class discussions" },
      { label: "D", text: "Searching for educational resources online" },
    ],
    answer: "B",
  },
];
