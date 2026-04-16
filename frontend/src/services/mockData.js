export const mockData = {
    startup: {
        name: "Nebula AI",
        stage: "MVP",
        problem: "Inefficient data processing for SMBs",
        solution: "AI-powered automated workflows",
        market: "$50B Global Market",
        progress: 65,
    },
    kpi: {
        totalTasks: 24,
        completedTasks: 16,
        pendingFeedback: 5,
        milestones: { total: 4, completed: 2 },
    },
    tasks: [
        { id: 1, title: 'Design Landing Page', status: 'In Progress', assignee: 'Alex', priority: 'High' },
        { id: 2, title: 'Integrate Stripe API', status: 'Todo', assignee: 'Sam', priority: 'High' },
        { id: 3, title: 'User Interview Script', status: 'Done', assignee: 'Jordan', priority: 'Medium' },
        { id: 4, title: 'Setup Analytics', status: 'Todo', assignee: 'Alex', priority: 'Low' },
    ],
    feedback: [
        { id: 1, user: 'BetaUser_01', rating: 4, comment: 'Great UI, but load time is slow.', status: 'New' },
        { id: 2, user: 'Investor_Dave', rating: 5, comment: 'Solid value prop. Pitch deck needs work.', status: 'Reviewed' },
        { id: 3, user: 'EarlyAdopter', rating: 3, comment: 'Missing dark mode.', status: 'New' },
    ],
    analytics: [
        { name: 'Mon', tasks: 2, feedback: 1 },
        { name: 'Tue', tasks: 3, feedback: 0 },
        { name: 'Wed', tasks: 5, feedback: 2 },
        { name: 'Thu', tasks: 4, feedback: 1 },
        { name: 'Fri', tasks: 6, feedback: 3 },
        { name: 'Sat', tasks: 3, feedback: 1 },
        { name: 'Sun', tasks: 1, feedback: 0 },
    ],
    team: [
        { id: 1, name: 'Alex Founder', role: 'CEO', avatar: 'AF' },
        { id: 2, name: 'Sam Tech', role: 'CTO', avatar: 'ST' },
        { id: 3, name: 'Jordan Design', role: 'Product', avatar: 'JD' },
    ]
};

export const investorMockData = {
    overview: {
        totalViewed: 124,
        shortlisted: 18,
        investmentsMade: 6,
        availableBudget: "$2.5M"
    },
    startups: [
        {
            id: 1,
            name: "EcoCharge",
            industry: "CleanTech",
            stage: "Revenue",
            fundingRequired: "$1.2M",
            traction: "50k Users / 20% MoM",
            location: "San Francisco, CA",
            problem: "EV charging is slow and expensive for long-haul trucking.",
            solution: "Ultra-fast charging network powered by solar micro-grids.",
            businessModel: "SaaS + Transactional fees per charge.",
            marketSize: "$120B TAM by 2030",
            team: [
                { name: "Dr. Sarah Chen", role: "CEO", experience: "Ex-Tesla Engineer" },
                { name: "Marcus Thorne", role: "CTO", experience: "PhD in Solar Energy" }
            ],
            equity: "10%",
            valuation: "$12M",
            roi: "15x Est.",
            risk: "Medium",
            growthData: [
                { month: 'Jan', users: 12000 },
                { month: 'Feb', users: 15000 },
                { month: 'Mar', users: 19000 },
                { month: 'Apr', users: 24000 },
                { month: 'May', users: 32000 },
                { month: 'Jun', users: 50000 }
            ]
        },
        {
            id: 2,
            name: "HealthSync",
            industry: "HealthTech",
            stage: "MVP",
            fundingRequired: "$500k",
            traction: "15 Clinics / 5k Patients",
            location: "New York, NY",
            problem: "Fragmented patient data across different healthcare providers.",
            solution: "Interoperable data layer using blockchain for secure records.",
            businessModel: "Subscription per clinic/hospital.",
            marketSize: "$85B Global EMR Market",
            team: [
                { name: "John Doe", role: "CEO", experience: "15yrs in Healthcare Admin" },
                { name: "Jane Smith", role: "CTO", experience: "Blockchain Expert" }
            ],
            equity: "8%",
            valuation: "$6.25M",
            roi: "10x Est.",
            risk: "High",
            growthData: [
                { month: 'Jan', users: 500 },
                { month: 'Feb', users: 800 },
                { month: 'Mar', users: 1200 },
                { month: 'Apr', users: 2000 },
                { month: 'May', users: 3500 },
                { month: 'Jun', users: 5000 }
            ]
        },
        {
            id: 3,
            name: "FinFlow",
            industry: "FinTech",
            stage: "Idea",
            fundingRequired: "$250k",
            traction: "Waitlist of 2k",
            location: "London, UK",
            problem: "Freelancers struggle with multi-currency tax compliance.",
            solution: "Automated tax withholding and reporting for 50+ countries.",
            businessModel: "Freemium + Premium Features.",
            marketSize: "$30B Freelance Economy",
            team: [
                { name: "Alice Brown", role: "CEO", experience: "Former Tax Consultant" },
                { name: "Bob Wilson", role: "CTO", experience: "Fintech Architect" }
            ],
            equity: "5%",
            valuation: "$5M",
            roi: "20x Est.",
            risk: "Very High",
            growthData: [
                { month: 'Jan', users: 100 },
                { month: 'Feb', users: 300 },
                { month: 'Mar', users: 700 },
                { month: 'Apr', users: 1200 },
                { month: 'May', users: 1800 },
                { month: 'Jun', users: 2000 }
            ]
        }
    ],
    recommended: [
        { id: 4, name: "AquaPure", industry: "SustainTech", stage: "Revenue", fundingRequired: "$2M" },
        { id: 5, name: "BioGen", industry: "BioTech", stage: "MVP", fundingRequired: "$3M" },
        { id: 6, name: "CyberShield", industry: "Cybersecurity", stage: "Revenue", fundingRequired: "$5M" }
    ],
    watchlist: [1, 3],
    analytics: {
        distribution: [
            { name: 'CleanTech', value: 40 },
            { name: 'HealthTech', value: 30 },
            { name: 'FinTech', value: 20 },
            { name: 'Others', value: 10 }
        ],
        performance: [
            { name: 'Q1', growth: 12 },
            { name: 'Q2', growth: 18 },
            { name: 'Q3', growth: 25 },
            { name: 'Q4', growth: 32 }
        ]
    }
};

const loadFeedback = () => {
    const saved = localStorage.getItem('feedback');
    return saved ? JSON.parse(saved) : mockData.feedback;
};

export const getStartupDetails = () => Promise.resolve(mockData.startup);
export const getKPIs = () => Promise.resolve(mockData.kpi);
export const getTasks = () => Promise.resolve(mockData.tasks);
export const getFeedback = () => Promise.resolve(loadFeedback());
export const getAnalytics = () => Promise.resolve(mockData.analytics);
export const getTeam = () => Promise.resolve(mockData.team);

export const addFeedback = (newFeedback) => {
    const feedback = loadFeedback();
    const feedbackItem = {
        id: Date.now(),
        ...newFeedback,
        status: 'New',
        date: new Date().toISOString()
    };
    const updatedFeedback = [feedbackItem, ...feedback];
    localStorage.setItem('feedback', JSON.stringify(updatedFeedback));
    return Promise.resolve(feedbackItem);
};

export const deleteFeedback = (id) => {
    const feedback = loadFeedback();
    const updatedFeedback = feedback.filter(item => item.id !== id);
    localStorage.setItem('feedback', JSON.stringify(updatedFeedback));
    return Promise.resolve(true);
};

export const markFeedbackReviewed = (id) => {
    const feedback = loadFeedback();
    const updatedFeedback = feedback.map(item =>
        item.id === id ? { ...item, status: 'Reviewed' } : item
    );
    localStorage.setItem('feedback', JSON.stringify(updatedFeedback));
    return Promise.resolve(true);
};
