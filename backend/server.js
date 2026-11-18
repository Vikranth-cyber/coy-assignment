const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        initData();
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function initData() {
    const sampleImages = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=60"
    ];

    const names = [
        "Ananya Sharma", "Rahul Verma", "Sneha Reddy", "Arjun Nair", "Priya Iyer",
        "Karan Malhotra", "Meera Menon", "Rohan Gupta", "Divya Patel", "Vikram Singh",
        "Pooja Deshmukh", "Aditya Rao", "Neha Joshi", "Kabir Khan", "Ankita Roy",
        "Siddharth Verma", "Tanvi Kulkarni", "Varun Kapoor", "Shreya Sen", "Aakash Mehta",
        "Nisha Pillai", "Manish Tiwari", "Ritu Nambiar", "Yashvardhan Das", "Swati Nandedkar",
        "Tarun Bajaj", "Kavya Sridhar", "Nikhil Agarwal", "Simran Chawla", "Harsh Vardhan"
    ];

    const cities = ["Hyderabad", "Bengaluru", "Mumbai", "Delhi", "Pune", "Chennai"];
    const interestsList = [
        ["Reading", "Coding", "Coffee"], ["Travel", "Photography", "Hiking"],
        ["Fitness", "Cooking", "Music"], ["Art", "Movies", "Gaming"],
        ["Badminton", "Startups", "Design"], ["Yoga", "Running", "Podcasts"]
    ];

    const profiles = names.map((name, index) => {
        return {
            id: `p_${index + 1}`,
            name: name,
            age: 21 + (index % 7),
            photo: sampleImages[index % sampleImages.length],
            bio: `Hey there! Exploring new places and building cool tech in ${cities[index % cities.length]}.`,
            city: cities[index % cities.length],
            interests: interestsList[index % interestsList.length],
            // Only profiles at index 4, 12, and 21 have pre-liked the user. 
            // All other profiles require a mutual swipe to match.
            hasLikedUser: [4, 12, 21].includes(index)
        };
    });

    const initialDB = {
        swipedIds: [],
        likes: [],
        matches: []
    };

    writeData({ profiles, state: initialDB });
}

// Strip hasLikedUser so we never reveal who liked the user before a mutual match
const sanitizeProfile = ({ hasLikedUser, ...safeProfile }) => safeProfile;

app.get('/feed', (req, res) => {
    const db = readData();
    const swipedSet = new Set(db.state.swipedIds);
    const unswipedProfiles = db.profiles
        .filter(p => !swipedSet.has(p.id))
        .map(sanitizeProfile);
    res.json(unswipedProfiles);
});

app.post('/swipe', (req, res) => {
    const { profileId, action } = req.body;
    const db = readData();

    if (db.state.swipedIds.includes(profileId)) {
        return res.status(400).json({ error: "Profile already swiped" });
    }

    db.state.swipedIds.push(profileId);

    let isMatch = false;
    const targetProfile = db.profiles.find(p => p.id === profileId);

    if (action === 'like') {
        db.state.likes.push(profileId);
        if (targetProfile && targetProfile.hasLikedUser) {
            if (!db.state.matches.includes(profileId)) {
                db.state.matches.push(profileId);
            }
            isMatch = true;
        }
    }

    writeData(db);
    res.json({
        success: true,
        isMatch,
        matchedProfile: isMatch ? sanitizeProfile(targetProfile) : null
    });
});

app.get('/matches', (req, res) => {
    const db = readData();
    const matchedProfiles = db.profiles
        .filter(p => db.state.matches.includes(p.id))
        .map(sanitizeProfile);
    res.json(matchedProfiles);
});

app.post('/reset', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
    }
    initData();
    res.json({ success: true, message: "Reset database successfully" });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});