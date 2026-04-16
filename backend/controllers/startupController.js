const Startup = require('../models/Startup');
const User = require('../models/User');

// @desc    Create a startup
// @route   POST /api/startups
// @access  Private (Founder only)
exports.createStartup = async (req, res) => {
    const { name, problem, solution, market, stage } = req.body;

    console.log('Creating startup:', req.body);

    try {
        const startup = new Startup({
            name,
            problem,
            solution,
            market,
            stage,
            founder: req.user._id,
            team: [req.user._id] // Founder is part of the team
        });

        const createdStartup = await startup.save();

        // Link startup to user using findByIdAndUpdate to avoid validation errors with select('-password')
        await User.findByIdAndUpdate(req.user._id, { startup: createdStartup._id });

        // Update req.user for response if needed (optional)
        req.user.startup = createdStartup._id;

        res.status(201).json(createdStartup);
    } catch (error) {
        console.error('Error creating startup:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user's startup
// @route   GET /api/startups/my-startup
// @access  Private
exports.getMyStartup = async (req, res) => {
    try {
        // Find startup where user is in the team
        const startup = await Startup.findOne({
            team: req.user._id
        }).populate('team', 'name email role username');

        if (!startup) {
            return res.status(404).json({ message: 'No startup found. Please create a startup profile first.' });
        }

        res.json(startup);
    } catch (error) {
        console.error('Error fetching user startup:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get startup details
// @route   GET /api/startups/:id
// @access  Private
exports.getStartup = async (req, res) => {
    try {
        const startup = await Startup.findById(req.params.id).populate('team', 'name email role username');

        if (startup) {
            // Check if user belongs to this startup
            if (startup.team.some(member => member._id.toString() === req.user._id.toString())) {
                res.json(startup);
            } else {
                res.status(403).json({ message: 'Not authorized to view this startup' });
            }
        } else {
            res.status(404).json({ message: 'Startup not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update startup details
// @route   PUT /api/startups/:id
// @access  Private (Founder only)
exports.updateStartup = async (req, res) => {
    const { name, problem, solution, market, stage } = req.body;

    try {
        const startup = await Startup.findById(req.params.id);

        if (startup) {
            if (startup.founder.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this startup' });
            }

            startup.name = name || startup.name;
            startup.problem = problem || startup.problem;
            startup.solution = solution || startup.solution;
            startup.market = market || startup.market;
            startup.stage = stage || startup.stage;

            const updatedStartup = await startup.save();
            res.json(updatedStartup);
        } else {
            res.status(404).json({ message: 'Startup not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add team member
// @route   POST /api/startups/:id/members
// @access  Private (Founder only)
exports.addTeamMember = async (req, res) => {
    const { 
        name, 
        email, 
        memberId,
        username, 
        role, 
        department, 
        accessLevel, 
        phoneNumber, 
        joiningDate, 
        avatar, 
        status 
    } = req.body;

    try {
        const startup = await Startup.findById(req.params.id);
        if (!startup) return res.status(404).json({ message: 'Startup not found' });

        if (startup.founder.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add members' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if not found
            // Using a default password since it's not provided in the UI list
            user = await User.create({
                name,
                email,
                username: memberId || username || email.split('@')[0],
                password: 'password123', // Default password
                role: role || 'Team',
                department,
                accessLevel,
                phoneNumber,
                joiningDate: joiningDate || Date.now(),
                avatar,
                status: status || 'Active',
                startup: startup._id
            });
        } else {
            // Check if user is already in a startup
            if (user.startup && user.startup.toString() !== startup._id.toString()) {
                return res.status(400).json({ message: 'User already belongs to another startup' });
            }

            // Update existing user details
            user.name = name || user.name;
            user.username = memberId || username || user.username;
            user.role = role || user.role;
            user.department = department || user.department;
            user.accessLevel = accessLevel || user.accessLevel;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.joiningDate = joiningDate || user.joiningDate;
            user.avatar = avatar || user.avatar;
            user.status = status || user.status;
            user.startup = startup._id;
            await user.save();
        }

        // Add to startup team array if not already there
        if (!startup.team.includes(user._id)) {
            startup.team.push(user._id);
            await startup.save();
        }

        res.json({ message: 'Team member added successfully', team: startup.team });

    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ message: error.message });
    }
};
